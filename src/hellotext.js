import { Configuration, Event } from './core'

import API, { Response, keepaliveFor } from './api'
import {
  Business,
  Fingerprint,
  FormCollection,
  Page,
  Popup,
  Query,
  Session,
  User,
  Webchat,
  WhatsAppWidget,
} from './models'

import { NotInitializedError } from './errors'

class Hellotext {
  static eventEmitter = new Event()
  static forms
  static business
  static popup
  static popups = []
  static webchat
  static whatsapp
  static initializationGeneration = 0
  static initializationBaseline

  /**
   * initialize the module.
   * @param business public business id
   * @param { Configuration } config
   */
  static async initialize(business, config = {}) {
    const generation = ++this.initializationGeneration
    this.initializationBaseline ||= {
      configuration: this.configurationSnapshot(),
      runtime: this.runtimeSnapshot(),
    }
    const { configuration, runtime: previous } = this.initializationBaseline
    const staged = { popups: [] }
    const nextBusiness = new Business(business)

    try {
      const businessData = await nextBusiness.hydrate({
        apiRoot: config.apiRoot,
        stylesheet: false,
      })

      if (!this.initializationIsCurrent(generation)) return
      if (!businessData && this.hasMountedSurfaces(previous)) {
        if (!this.hasExplicitSurface(config) && this.hasDisabledSurface(config)) {
          this.restoreRuntime(this.runtimeWithoutDisabledSurfaces(previous, config))
        } else if (!this.hasExplicitSurface(config)) {
          this.restoreRuntime(previous)
        }

        if (!this.hasExplicitSurface(config)) {
          this.restoreConfiguration(configuration)
          return
        }
      }

      Configuration.assign(config)
      this.business = nextBusiness
      nextBusiness.loadStylesheet()
      this.page = new Page()
      Session.initialize(this.page)
      this.forms = new FormCollection()
      this.query = new Query()
      this.popup = undefined
      this.popups = []
      this.webchat = undefined
      this.whatsapp = undefined

      const popupConfigs =
        config.popup === false ? [] : this.popupConfigs(businessData, config.popup || {})
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

      if (webchatConfig && webchatConfig.id) {
        Configuration.webchat.assign(webchatConfig)
        staged.webchat = await Webchat.load(webchatConfig.id)
        if (!this.initializationIsCurrent(generation)) return
      }

      if (whatsappConfig && whatsappConfig.id) {
        Configuration.whatsapp.assign(whatsappConfig)
        staged.whatsapp = await WhatsAppWidget.load(whatsappConfig.id)
        if (!this.initializationIsCurrent(generation)) return
      }

      if (popupConfigs.length > 0) {
        Configuration.popup.assign(popupConfigs[0])
        for (const popupConfig of popupConfigs) {
          const popup = await Popup.load(popupConfig.id)
          staged.popups.push(popup)
          if (!this.initializationIsCurrent(generation)) return
        }
      }

      this.unmountSurfaces(previous)
      previous.business?.releaseStylesheet?.()
      staged.webchat?.markCoexistingWidgets?.()
      staged.whatsapp?.markCoexistingWidgets?.()
      this.webchat = staged.webchat
      this.whatsapp = staged.whatsapp
      this.popups = staged.popups
      this.popup = staged.popups[0]

      if (typeof MutationObserver !== 'undefined') {
        this.forms.collectExistingFormsOnPage()
      }
    } catch (error) {
      this.unmountSurfaces(staged)
      nextBusiness.releaseStylesheet()

      if (this.initializationIsCurrent(generation)) {
        this.restoreRuntime(previous)
        this.restoreConfiguration(configuration)
      }

      throw error
    } finally {
      if (!this.initializationIsCurrent(generation)) {
        this.unmountSurfaces(staged)
        nextBusiness.releaseStylesheet()
      } else {
        this.initializationBaseline = undefined
      }
    }
  }

  static initializationIsCurrent(generation) {
    return this.initializationGeneration === generation
  }

  static unmountPopups() {
    this.unmountSurfaces({ popups: this.popups })
  }

  static unmountSurfaces({ popups = [], webchat, whatsapp }) {
    new Set([...popups, webchat, whatsapp]).forEach(surface => surface?.unmount?.())
  }

  static runtimeSnapshot() {
    return {
      business: this.business,
      page: this.page,
      forms: this.forms,
      query: this.query,
      popup: this.popup,
      popups: this.popups,
      webchat: this.webchat,
      whatsapp: this.whatsapp,
    }
  }

  static hasExplicitSurface(config) {
    return [config.popup, config.webchat, config.whatsappWidget].some(
      surface => surface && surface !== false && surface.id,
    )
  }

  static hasDisabledSurface(config) {
    return config.popup === false || config.webchat === false || config.whatsappWidget === false
  }

  static runtimeWithoutDisabledSurfaces(previous, config) {
    const disabled = {
      popups: config.popup === false ? previous.popups : [],
      webchat: config.webchat === false ? previous.webchat : undefined,
      whatsapp: config.whatsappWidget === false ? previous.whatsapp : undefined,
    }
    this.unmountSurfaces(disabled)

    return {
      ...previous,
      popup: config.popup === false ? undefined : previous.popup,
      popups: config.popup === false ? [] : previous.popups,
      webchat: config.webchat === false ? undefined : previous.webchat,
      whatsapp: config.whatsappWidget === false ? undefined : previous.whatsapp,
    }
  }

  static hasMountedSurfaces({ popups = [], webchat, whatsapp }) {
    return popups.length > 0 || !!webchat || !!whatsapp
  }

  static restoreRuntime(snapshot) {
    Object.assign(this, snapshot)
  }

  static configurationSnapshot() {
    return {
      apiRoot: Configuration.apiRoot,
      actionCableUrl: Configuration.actionCableUrl,
      autoGenerateSession: Configuration.autoGenerateSession,
      session: Configuration.session,
      locale: Configuration.locale,
      forms: {
        autoMount: Configuration.forms.autoMount,
        successMessage: Configuration.forms.successMessage,
      },
      popup: {
        id: Configuration.popup.id,
        container: Configuration.popup.container,
        device: Configuration.popup.device,
      },
      webchat: {
        id: Configuration.webchat.id,
        container: Configuration.webchat.container,
        placement: Configuration.webchat.placement,
        style: this.clone(Configuration.webchat.style),
        appearance: this.clone(Configuration.webchat.appearance),
        whatsapp: this.clone(Configuration.webchat.whatsapp),
        mode: Configuration.webchat.mode,
        behaviour: this.clone(Configuration.webchat.behaviour),
        behaviourOverride: Configuration.webchat.hasBehaviourOverride,
        strategy: Configuration.webchat._strategy,
      },
      whatsapp: {
        id: Configuration.whatsapp.id,
        container: Configuration.whatsapp.container,
        placement: Configuration.whatsapp.placement,
        appearance: this.clone(Configuration.whatsapp.appearance),
        number: Configuration.whatsapp.number,
        body: Configuration.whatsapp.body,
      },
    }
  }

  static restoreConfiguration(snapshot) {
    Configuration.apiRoot = snapshot.apiRoot
    Configuration.actionCableUrl = snapshot.actionCableUrl
    Configuration.autoGenerateSession = snapshot.autoGenerateSession
    Configuration.session = snapshot.session
    Configuration.locale = snapshot.locale
    Configuration.forms.assign(snapshot.forms)
    Configuration.popup.assign(snapshot.popup)
    Configuration.webchat.assign(snapshot.webchat)
    Configuration.webchat.behaviourOverride = snapshot.webchat.behaviourOverride
    Configuration.whatsapp.assign(snapshot.whatsapp)
  }

  static clone(value) {
    if (Array.isArray(value)) return value.map(item => this.clone(item))
    if (!this.isPlainObject(value)) return value

    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.clone(item)]))
  }

  static mergeWebchatConfig(dashboardConfig, localConfig) {
    return this.deepMergePlainObjects(dashboardConfig, localConfig)
  }

  static mergeWhatsAppConfig(dashboardConfig, localConfig) {
    return this.deepMergePlainObjects(dashboardConfig, localConfig)
  }

  static mergePopupConfig(dashboardConfig, localConfig) {
    return this.deepMergePlainObjects(dashboardConfig, localConfig)
  }

  static popupConfigs(businessData, localConfig) {
    if (localConfig.id) {
      return [localConfig]
    }

    const configuredPopups = Array.isArray(businessData && businessData.popups)
      ? businessData.popups.filter(config => config && config.id)
      : []
    const dashboardConfigs =
      configuredPopups.length > 0 ? configuredPopups : [(businessData && businessData.popup) || {}]

    return dashboardConfigs
      .filter(config => config && config.id)
      .map(config => this.mergePopupConfig(config, localConfig))
      .filter(
        (config, index, configs) =>
          configs.findIndex(candidate => candidate.id === config.id) === index,
      )
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
      session: this.session,
      user_parameters,
      action,
      ...params,
      ...pageInstance.trackingData,
    }

    delete body.headers

    return await API.events.create({
      headers,
      body,
      // Track is the SDK's unload-sensitive analytics path. Keepalive belongs
      // here rather than on identify/forms/webchat calls because event tracking
      // is allowed to be fire-and-navigate, while those other calls have
      // stronger request/response or interaction contracts.
      keepalive: keepaliveFor(body),
    })
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
