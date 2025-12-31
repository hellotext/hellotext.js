import { Configuration, Event } from './core'

import API, { Response } from './api'
import { Business, FormCollection, Page, Query, Session, User, Webchat } from './models'

import { NotInitializedError } from './errors'

class Hellotext {
  static eventEmitter = new Event()
  static forms
  static business
  static webchat

  /**
   * initialize the module.
   * @param business public business id
   * @param { Configuration } config
   */
  static async initialize(business, config) {
    Configuration.assign(config)
    Session.initialize()

    this.page = new Page()
    this.business = new Business(business)
    this.forms = new FormCollection()

    this.query = new Query()

    if (Configuration.webchat.id) {
      this.webchat = await Webchat.load(Configuration.webchat.id)
    }

    if (typeof MutationObserver !== 'undefined') {
      this.forms.collectExistingFormsOnPage()
    }
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

    const pageInstance = params && params.url ? new Page(params.url) : this.page

    const body = {
      session: this.session,
      user: User.identificationData,
      action,
      ...params,
      ...pageInstance.trackingData,
    }

    delete body.headers

    return await API.events.create({
      headers,
      body,
    })
  }

  /**
   * @typedef { Object } IdentificationOptions
   * @property { String } [email] - the email of the user
   * @property { String } [phone] - the phone number of the user
   * @property { String } [name] - the name of the user
   * @property { String } [source] - the platform specific identifier where this pixel is running on.
   *
   * Identifies a user and attaches the hello_session to the user ID
   * @param { String } externalId - the user ID
   * @param { IdentificationOptions } options - the options for the identification
   * @returns {Promise<Response>}
   */
  static async identify(externalId, options = {}) {
    if (User.id === externalId) {
      return new Response(true, {
        json: async () => {
          already_identified: true
        },
      })
    }

    const response = await API.identifications.create({
      user_id: externalId,
      ...options,
    })

    if (response.succeeded) {
      User.remember(externalId, options.source)
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
    return this.business.id === undefined
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
