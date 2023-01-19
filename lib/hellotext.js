import { NotInitializedError } from './errors/notInitializedError'

const apiUrl = 'https://api.hellotext.com/v1/'

class Hellotext {
  static #_session
  static #business_id
  static #observer
  /**
   * initialize the module.
   */
  static initialize(business_id) {
    this.#business_id = business_id
    this.#observer = new SessionObserver(this.#business_id)

    const urlSearchParams = new URLSearchParams(window.location.search)
    const session = urlSearchParams.get('hello_session') || getCookieValue('hello_session')

    if (session && session !== "undefined" && session !== "null") {
      this.#_session = session
      this.#setSessionCookie()
    } else {
      this.#observer.mint()

      this.#observer.subscribe((response) => {
        console.log("response is", response)
        this.#_session = response.id
        console.log("session set to", this.#_session)
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
  static async track(action, params) {
    if (this.notInitialized) { throw new NotInitializedError() }

    const response = await fetch(apiUrl + 'track/events', {
      headers: this.headers,
      method: 'post',
      body: JSON.stringify({
        session: await this.session,
        action,
        ...params,
        url: (params && params.url) || window.location.href
      }),
    })

    const body = await response.json()
    body.success = response.status === 200

    return body
  }

  /**
   *
   * @returns {Promise<any>|String}
   */
  static get session() {
    if (this.notInitialized) { throw new NotInitializedError() }

    if (this.#_session) {
      return this.#_session
    } else {
      return this.session
    }
  }

  // private

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

    document.cookie = `hello_session=${this.#_session}`
  }

  static get notInitialized() {
    return this.#business_id === undefined
  }
}

class SessionObserver {
  constructor(business_id) {
    this.business_id = business_id
    this.handlers = []
  }

  subscribe(handler) {
    this.handlers.push(handler)
    console.log("subscribed")
  }

  unsubscribe(handler) {
    this.handlers = this.handlers.filter(subscriber => subscriber !== handler)
  }

  async mint() {
    const trackingUrl = apiUrl + 'track/sessions'

    console.log("fetching", trackingUrl)

    this.mintingPromise = await fetch(trackingUrl, {
      method: 'post',
      headers: { Authorization: `Bearer ${this.business_id}` },
    })

    this.response = await this.mintingPromise.json()

    this.handlers.forEach((handler) => {
      handler(this.response)
    })

    console.log("this response is", this.response)
  }

  get pending() {
    return this.response === undefined
  }
}

const getCookieValue = name => document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()

export default Hellotext
