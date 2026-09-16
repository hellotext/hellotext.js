import { Configuration, Event } from './core'

import API, { Response, keepaliveFor } from './api'
import {
  Alert,
  Business,
  Fingerprint,
  FormCollection,
  Page,
  Popup,
  Push,
  Query,
  Session,
  User,
  UTM,
  Webchat,
  WhatsAppWidget,
} from './models'

import { NotInitializedError } from './errors'

// The campaign parameters display rules can target. `utm_term` and `utm_content` are not
// among them, so a link carrying only those does not stand for a campaign here.
const CAMPAIGN_RULE_KEYS = ['source', 'medium', 'campaign']

const ACTIVITY_RULE_FIELDS = {
  'product.viewed': 'activity.product_viewed',
  'cart.added': 'activity.cart_added',
  'order.placed': 'activity.purchase_completed',
  'product.purchased': 'activity.purchase_completed',
  'form.completed': 'activity.form_completed',
}

class Hellotext {
  static eventEmitter = new Event()
  static activities = new Set()
  static pageViews = 1
  static visitCampaign = {}
  static visitorType = 'new'
  static visitBusinessId
  static lastPageUrl
  static pageStartedAt
  static forms
  static business
  static popup
  static webchat
  static whatsapp
  static push
  static alert
  static initializationVersion = 0

  /**
   * initialize the module.
   * @param business public business id
   * @param { Configuration } config
   */
  static async initialize(business, config = {}) {
    const initializationVersion = ++this.initializationVersion
    this.popup?.unmount?.()
    this.popup = undefined

    this.alert?.dispose()
    this.alert = null
    this.push?.dispose()
    this.push = null

    const businessContext = new Business(business)
    this.business = businessContext
    this.page = new Page()

    Configuration.assign({ push: {}, ...config })
    Session.initialize(this.page)
    this.initializeVisitSignals(business)

    this.forms = new FormCollection()

    this.query = new Query()

    const businessData = await businessContext.hydrate()
    if (this.business !== businessContext) return

    let stagedPush = null
    let stagedAlert = null

    if (config.push !== false && businessData?.push?.public_key && Push.supported) {
      stagedPush = new Push(businessData.push)
      if (businessData.alert?.html)
        stagedAlert = new Alert(businessData.alert, businessContext, stagedPush)
    }

    const popupConfig =
      config.popup === false
        ? false
        : this.deepMergePlainObjects((businessData && businessData.popup) || {}, config.popup || {})

    const webchatConfig =
      config.webchat === false
        ? false
        : this.mergeWebchatConfig(
            (businessData && businessData.webchat) || {},
            config.webchat || {},
          )
    const whatsappConfig =
      config.whatsappWidget === false
        ? false
        : this.mergeWhatsAppConfig(
            (businessData && businessData.whatsapp) || {},
            config.whatsappWidget || {},
          )

    const hasExplicitBehaviourOverride =
      config.webchat &&
      config.webchat !== false &&
      Object.prototype.hasOwnProperty.call(config.webchat, 'behaviour')
    Configuration.webchat.behaviourOverride = hasExplicitBehaviourOverride

    const widgetLoads = []

    if (webchatConfig && webchatConfig.id) {
      Configuration.webchat.assign(webchatConfig)
      widgetLoads.push(
        Webchat.load(webchatConfig.id).then(webchat => {
          if (this.business === businessContext) this.webchat = webchat
        }),
      )
    }

    if (whatsappConfig && whatsappConfig.id) {
      Configuration.whatsapp.assign(whatsappConfig)
      widgetLoads.push(
        WhatsAppWidget.load(whatsappConfig.id).then(whatsapp => {
          if (this.business === businessContext) this.whatsapp = whatsapp
        }),
      )
    }

    if (popupConfig && popupConfig.id) {
      const resolvedPopupConfig = { container: 'body', device: 'auto', ...popupConfig }
      Configuration.popup.assign(resolvedPopupConfig)
      widgetLoads.push(
        Popup.load(resolvedPopupConfig.id, {
          container: resolvedPopupConfig.container,
          shouldMount: () => {
            return (
              this.business === businessContext &&
              this.initializationVersion === initializationVersion
            )
          },
        }).then(popup => {
          if (
            this.business === businessContext &&
            this.initializationVersion === initializationVersion
          ) {
            this.popup = popup
          }
        }),
      )
    }

    await Promise.all(widgetLoads)
    if (this.business !== businessContext || this.initializationVersion !== initializationVersion)
      return

    this.push = stagedPush
    this.alert = stagedAlert
    this.push?.initialize().catch(error => {
      console.warn('Hellotext Push initialization failed:', error)
    })

    if (typeof MutationObserver !== 'undefined') {
      this.forms.collectExistingFormsOnPage()
    }
  }

  static mergeWebchatConfig(dashboardConfig, localConfig) {
    return this.deepMergePlainObjects(dashboardConfig, localConfig)
  }

  static mergeWhatsAppConfig(dashboardConfig, localConfig) {
    return this.deepMergePlainObjects(dashboardConfig, localConfig)
  }

  static deepMergePlainObjects(base, override) {
    const result = { ...base }

    Object.entries(override).forEach(([key, value]) => {
      if (this.isPlainObject(value) && this.isPlainObject(result[key])) {
        result[key] = this.deepMergePlainObjects(result[key], value)
      } else {
        result[key] = value
      }
    })

    return result
  }

  static isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  /**
   * Tracks an action that has happened on the page
   *
   * @param { String } action a valid action name
   * @param { Object } params
   * @returns {Promise<Response>}
   */
  static async track(action, params = {}) {
    if (this.notInitialized) {
      throw new NotInitializedError()
    }

    const business = this.business
    const session = this.session
    const visitBusinessId = this.visitBusinessId
    const headers = {
      ...((params && params.headers) || {}),
      ...this.headers,
    }

    const user_parameters = {
      ...User.identificationData,
      ...(params.user_parameters || {}),
    }

    const pageInstance = params && params.url ? new Page(params.url) : this.page

    const body = {
      session,
      user_parameters,
      action,
      ...params,
      ...pageInstance.trackingData,
    }

    delete body.headers

    const response = await API.events.create({
      headers,
      body,
      // Track is the SDK's unload-sensitive analytics path. Keepalive belongs
      // here rather than on identify/forms/webchat calls because event tracking
      // is allowed to be fire-and-navigate, while those other calls have
      // stronger request/response or interaction contracts.
      keepalive: keepaliveFor(body),
    })

    const trackedAt = params.tracked_at ? new Date(params.tracked_at) : null
    if (
      response.succeeded &&
      this.business === business &&
      this.session === session &&
      this.visitBusinessId === visitBusinessId &&
      (!trackedAt || (Number.isFinite(trackedAt.getTime()) && trackedAt >= this.pageStartedAt))
    )
      this.recordActivity(action)

    return response
  }

  static recordActivity(action) {
    const field = ACTIVITY_RULE_FIELDS[action]
    if (!field) return

    this.activities.add(field)
    this.writeStorage(
      'sessionStorage',
      this.visitStorageKey('activities'),
      JSON.stringify([...this.activities]),
    )
    this.eventEmitter.dispatch('activity:occurred', { action, field })
  }

  static initializeVisitSignals(businessId) {
    const businessChanged = this.visitBusinessId !== businessId
    this.visitBusinessId = businessId

    if (businessChanged) {
      this.pageViews = 0
      this.lastPageUrl = undefined
      this.activities = new Set(this.readStoredActivities())
      this.visitCampaign = this.readStoredVisitCampaign()
      const storedVisitorType = this.readStorage(
        'sessionStorage',
        this.visitStorageKey('visitor-type'),
      )
      this.visitorType = ['new', 'returning'].includes(storedVisitorType)
        ? storedVisitorType
        : undefined

      if (!this.visitorType) {
        this.visitorType = this.readStorage('localStorage', this.visitStorageKey('seen'))
          ? 'returning'
          : 'new'
        this.writeStorage('sessionStorage', this.visitStorageKey('visitor-type'), this.visitorType)
        this.writeStorage('localStorage', this.visitStorageKey('seen'), '1')
      }
    }

    this.rememberVisitCampaign(UTM.paramsFrom(window.location.search))

    if (businessChanged || this.lastPageUrl !== window.location.href) this.recordPageView()
  }

  /**
   * Remembers the campaign this visit arrived with, for as long as the tab lives — the same
   * span as the other visit signals.
   *
   * Display rules read it when the URL no longer carries the parameters, which is the common
   * case: the visitor moves past the landing page, or the site strips them from the URL once
   * its analytics have read them. Persisted attribution answers a different question and is
   * left alone: `hello_utm` still records only a complete source and medium pair, and still
   * outlives the visit.
   */
  static rememberVisitCampaign(params) {
    const campaign = Object.fromEntries(
      CAMPAIGN_RULE_KEYS.flatMap(key => {
        const value = typeof params?.[key] === 'string' ? params[key].trim() : ''

        return value === '' ? [] : [[key, value]]
      }),
    )
    if (Object.keys(campaign).length === 0) return

    this.visitCampaign = campaign
    this.writeStorage('sessionStorage', this.visitStorageKey('campaign'), JSON.stringify(campaign))
  }

  static readStoredVisitCampaign() {
    try {
      const stored = JSON.parse(
        this.readStorage('sessionStorage', this.visitStorageKey('campaign')) || '{}',
      )
      if (stored === null || typeof stored !== 'object' || Array.isArray(stored)) return {}

      return Object.fromEntries(
        Object.entries(stored).filter(
          ([key, value]) => CAMPAIGN_RULE_KEYS.includes(key) && typeof value === 'string',
        ),
      )
    } catch (_) {
      return {}
    }
  }

  static recordPageView() {
    const key = this.visitStorageKey('page-views')
    const stored = Number(this.readStorage('sessionStorage', key))
    this.pageViews = Number.isInteger(stored) && stored > 0 ? stored + 1 : this.pageViews + 1
    this.lastPageUrl = window.location.href
    this.pageStartedAt = Date.now()
    this.writeStorage('sessionStorage', key, String(this.pageViews))
  }

  static readStoredActivities() {
    try {
      const stored = JSON.parse(
        this.readStorage('sessionStorage', this.visitStorageKey('activities')) || '[]',
      )
      return Array.isArray(stored)
        ? stored.filter(field => Object.values(ACTIVITY_RULE_FIELDS).includes(field))
        : []
    } catch (_) {
      return []
    }
  }

  static visitStorageKey(name) {
    return `hellotext:business:${this.visitBusinessId}:${name}`
  }

  static storage(name) {
    try {
      return window[name]
    } catch (_) {
      return null
    }
  }

  static readStorage(name, key) {
    try {
      return this.storage(name)?.getItem(key)
    } catch (_) {
      return null
    }
  }

  static writeStorage(name, key, value) {
    try {
      this.storage(name)?.setItem(key, value)
    } catch (_) {
      // Storage may be unavailable in privacy-restricted browser contexts.
    }
  }

  /**
   * @typedef { Object } IdentificationOptions
   * @property { String } [email] - the email of the user
   * @property { String } [phone] - the phone number of the user
   * @property { String } [name] - the name of the user
   * @property { String } [source] - the platform specific identifier where this pixel is running on.
   *
   * Identifies a user and attaches the hello_session to the user ID.
   * Repeated calls are skipped only when the last successful identify payload
   * for the current session remains unchanged.
   * @param { String } externalId - the user ID
   * @param { IdentificationOptions } options - the options for the identification
   * @returns {Promise<Response>}
   */
  static async identify(externalId, options = {}) {
    const fingerprint = await Fingerprint.generate(this.session, externalId, options)

    if (Fingerprint.matches(User.fingerprint, fingerprint)) {
      return new Response(true, {
        json: async () => ({
          already_identified: true,
        }),
      })
    }

    const response = await API.identifications.create({
      user_id: externalId,
      ...options,
    })

    if (response.succeeded) {
      User.remember(externalId, options.source, fingerprint)
    }

    return response
  }

  /**
   * Clears the user session, use when the user logs out to clear the hello cookies
   *
   * @returns {void}
   */
  static forget() {
    User.forget()
  }

  /**
   * Registers an event listener
   * @param event the name of the event to listen to
   * @param callback the callback. This method will be called with the payload
   */
  static on(event, callback) {
    this.eventEmitter.addSubscriber(event, callback)
  }

  /**
   * Removes an event listener
   * @param event the name of the event to remove
   * @param callback the callback to remove
   */
  static removeEventListener(event, callback) {
    this.eventEmitter.removeSubscriber(event, callback)
  }

  /**
   *
   * @returns {String}
   */
  static get session() {
    return Session.session
  }

  /**
   * Determines if the session is set or not
   * @returns {boolean}
   */
  static get isInitialized() {
    return Session.session !== undefined
  }

  // private

  static get notInitialized() {
    return !this.business || this.business.id === undefined
  }

  static get headers() {
    if (this.notInitialized) {
      throw new NotInitializedError()
    }

    return {
      Authorization: `Bearer ${this.business.id}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }
}

export default Hellotext
