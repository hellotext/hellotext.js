import EventEmitter from "./eventEmitter"
import Response from "./response";
import Query from "./query";

import { NotInitializedError } from './errors/notInitializedError'

import { Forms } from './forms'
import { Business } from './models'

/**
 * @typedef {Object} Config
 * @property {Boolean} autogenerateSession
 */


class Hellotext {
  static __apiURL = 'http://api.lvh.me:3000/v1/'

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
    this.forms = new Forms()

    this.#config = config
    this.#query = new Query(window.location.search)

    addEventListener('load', () => {
      this.forms.collect()
    })

    if(this.#query.has("preview")) return

    const session = this.#query.get("session") || this.#cookie

    if (session && session !== "undefined" && session !== "null") {
      this.#session = session
      this.#setSessionCookie()
    } else if(config.autogenerateSession) {
      this.#mintAnonymousSession()
        .then(response => {
          this.#session = response.id
          this.#setSessionCookie()
        })
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
    if (this.#notInitialized) { throw new NotInitializedError() }

    if(this.#query.has("preview")) {
      return new Response(true, { received: true })
    }

    const response = await fetch(this.__apiURL + 'track/events', {
      headers: this.headers,
      method: 'post',
      body: JSON.stringify({
        session: this.session,
        action,
        ...params,
        url: (params && params.url) || window.location.href
      }),
    })

    return new Response(response.status === 200, await response.json())
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

    const trackingUrl = this.__apiURL + 'track/sessions'

    this.mintingPromise = await fetch(trackingUrl, {
      method: 'post',
      headers: { Authorization: `Bearer ${this.business.id}` },
    })

    return this.mintingPromise.json()
  }

  static get headers() {
    if (this.#notInitialized) { throw new NotInitializedError() }

    return {
      Authorization: `Bearer ${this.business.id}`,
      Accept: 'application.json',
      'Content-Type': 'application/json',
    }
  }

  static #setSessionCookie() {
    if (this.#notInitialized) { throw new NotInitializedError() }

    if(this.eventEmitter.listeners) {
      this.eventEmitter.emit("session-set", this.#session)
    }

    document.cookie = `hello_session=${this.#session}`
  }

  static get #cookie() {
    return document.cookie.match('(^|;)\\s*' + 'hello_session' + '\\s*=\\s*([^;]+)')?.pop()
  }
}

export default Hellotext
