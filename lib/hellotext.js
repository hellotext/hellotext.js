import Event from "./event"
import EventEmitter from "./eventEmitter"
import Response from "./response";

import { NotInitializedError } from './errors/notInitializedError'
import { InvalidEvent } from "./errors/invalidEvent"

const apiUrl = 'https://api.hellotext.com/v1/'

class Hellotext {
  static #session
  static #business
  static #eventEmitter = new EventEmitter()

  /**
   * initialize the module.
   * @param business public business id
   */
  static initialize(business) {
    this.#business = business

    const urlSearchParams = new URLSearchParams(window.location.search)
    const session = urlSearchParams.get('hello_session') || this.#cookie

    if (session && session !== "undefined" && session !== "null") {
      this.#session = session
      this.#setSessionCookie()
    } else {
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
   * @returns {Promise}
   */
  static async track(action, params = {}) {
    if (this.#notInitialized) { throw new NotInitializedError() }

    const response = await fetch(apiUrl + 'track/events', {
      headers: this.#headers,
      method: 'post',
      body: JSON.stringify({
        session: this.session,
        action,
        ...params,
        url: (params && params.url) || window.location.href
      }),
    })

    return new Response(response.status === 200, await response.json)
  }

  /**
   * Registers an event listener
   * @param event the name of the event to listen to
   * @param callback the callback. This method will be called with the payload
   */
  static on(event, callback) {
    if(Event.invalid(event)) { throw new InvalidEvent(event) }

    this.#eventEmitter.addSubscriber(event, callback)
  }

  /**
   * Removes an event listener
   * @param event the name of the event to remove
   * @param callback the callback to remove
   */
  static disconnect(event, callback) {
    if(Event.invalid(event)) { throw new InvalidEvent(event) }

    this.#eventEmitter.removeSubscriber(event, callback)
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
    return this.#business === undefined
  }

  static async #mintAnonymousSession() {
    if (this.#notInitialized) { throw new NotInitializedError() }

    const trackingUrl = apiUrl + 'track/sessions'

    this.mintingPromise = await fetch(trackingUrl, {
      method: 'post',
      headers: { Authorization: `Bearer ${this.#business}` },
    })

    return this.mintingPromise.json()
  }

  static get #headers() {
    if (this.#notInitialized) { throw new NotInitializedError() }

    return {
      Authorization: `Bearer ${this.#business}`,
      Accept: 'application.json',
      'Content-Type': 'application/json',
    }
  }

  static #setSessionCookie() {
    if (this.#notInitialized) { throw new NotInitializedError() }

    if(this.#eventEmitter.listeners) {
      this.#eventEmitter.emit("session-set", this.#session)
    }

    document.cookie = `hello_session=${this.#session}`
  }

  static get #cookie() {
    return document.cookie.match('(^|;)\\s*' + 'hello_session' + '\\s*=\\s*([^;]+)')?.pop()
  }
}

export default Hellotext
