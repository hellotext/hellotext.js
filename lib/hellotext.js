import Event from "./event"
import EventEmitter from "./eventEmitter"

import { NotInitializedError } from './errors/notInitializedError'
import { InvalidEvent } from "./errors/invalidEvent"

const apiUrl = 'https://api.hellotext.com/v1/'

class Hellotext {
  static #_session
  static #business_id
  static #eventEmitter = new EventEmitter()

  /**
   * initialize the module.
   */
  static initialize(business_id) {
    this.#business_id = business_id

    const urlSearchParams = new URLSearchParams(window.location.search)
    const session = urlSearchParams.get('hello_session') || getCookieValue('hello_session')

    if (session && session !== "undefined" && session !== "null") {
      this.#_session = session
      this.#setSessionCookie()
    } else {
      this.mintAnonymousSession()
        .then(response => {
          this.#_session = response.id
          this.#setSessionCookie()
        })
    }
  }

  /**
   *
   * @param { String } action a valid action name
   * @param { Object } params
   * @returns {Promise}
   */
  static async track(action, params = {}) {
    if (this.notInitialized) { throw new NotInitializedError() }

    const response = await fetch(apiUrl + 'track/events', {
      headers: this.headers,
      method: 'post',
      body: JSON.stringify({
        session: this.session,
        action,
        ...params,
        url: (params && params.url) || window.location.href
      }),
    })

    const body = await response.json()
    body.success = response.status === 200

    return body
  }

  static on(event, callback) {
    if(Event.invalid(event)) { throw new InvalidEvent(event) }

    this.#eventEmitter.addSubscriber(event, callback)
  }

  static off(event, callback) {
    if(Event.invalid(event)) { throw new InvalidEvent(event) }

    this.#eventEmitter.removeSubscriber(event, callback)
  }

  /**
   *
   * @returns {String}
   */
  static get session() {
    if (this.notInitialized) { throw new NotInitializedError() }

    return this.#_session
  }

  static get isInitialized() {
    return this.#_session !== undefined
  }

  // private

  static get notInitialized() {
    return this.#business_id === undefined
  }

  static async mintAnonymousSession() {
    if (this.notInitialized) { throw new NotInitializedError() }

    const trackingUrl = apiUrl + 'track/sessions'

    this.mintingPromise = await fetch(trackingUrl, {
      method: 'post',
      headers: { Authorization: `Bearer ${this.#business_id}` },
    })

    return this.mintingPromise.json()
  }

  static get headers() {
    if (this.notInitialized) { throw new NotInitializedError() }

    return {
      Authorization: `Bearer ${this.#business_id}`,
      Accept: 'application.json',
      'Content-Type': 'application/json',
    }
  }

  static #setSessionCookie() {
    if (this.notInitialized) { throw new NotInitializedError() }

    if(this.#eventEmitter.listeners) {
      this.#eventEmitter.emit("session-set", this.#_session)
    }

    document.cookie = `hello_session=${this.#_session}`
  }
}

const getCookieValue = name => document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()

export default Hellotext
