import EventEmitter from "./eventEmitter"

import { NotInitializedError } from './errors/notInitializedError'

import {
  Business,
  Query,
  Cookies,
  FormCollection
} from './models'

import API, { Response } from './api'

/**
 * @typedef {Object} Config
 * @property {Boolean} autogenerateSession
 */

class Hellotext {
  static #session
  static #config
  static #query

  static eventEmitter = new EventEmitter()
  static forms
  static business

  /**
   * initialize the module.
   * @param business public business id
   * @param { Config } config
   */
  static initialize(business, config = { autogenerateSession: true }) {
    this.business = new Business(business)
    this.forms = new FormCollection()

    this.#config = config
    this.#query = new Query()

    addEventListener('load', () => {
      this.forms.collect()
    })

    if(this.#query.inPreviewMode) return

    if (this.#query.session) {
      this.#session = Cookies.set('hello_session', this.#query.session)
    } else if(config.autogenerateSession) {
      this.#mintAnonymousSession()
        .then(response => {
          this.#session = Cookies.set('hello_session', response.id)
        })
    }
  }

  static setSession(value) {
    this.#session = Cookies.set('hello_session', value)
  }

  /**
   * Tracks an action that has happened on the page
   *
   * @param { String } action a valid action name
   * @param { Object } params
   * @returns {Promise<Response>}
   */
  static async track(action, params = {}) {
    if (this.#notInitialized) { throw new NotInitializedError() }

    return await API.events.create({
      headers: this.headers,
      body: {
        session: this.session,
        action,
        ...params,
        url: (params && params.url) || window.location.href
      }
    })
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
    if (this.#notInitialized) { throw new NotInitializedError() }

    return this.#session
  }

  /**
   * Determines if the session is set or not
   * @returns {boolean}
   */
  static get isInitialized() {
    return this.#session !== undefined
  }

  // private

  static get #notInitialized() {
    return this.business.id === undefined
  }

  static async #mintAnonymousSession() {
    if (this.#notInitialized) { throw new NotInitializedError() }
    return API.sessions(this.business.id).create()
  }

  static get headers() {
    if (this.#notInitialized) { throw new NotInitializedError() }

    return {
      Authorization: `Bearer ${this.business.id}`,
      Accept: 'application.json',
      'Content-Type': 'application/json',
    }
  }
}

export default Hellotext
