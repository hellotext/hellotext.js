import { NotInitializedError } from './errors/notInitializedError'

const apiUrl = 'https://api.hellotext.com/v1/'

class Hellotext {
  static #_session
  static #business_id
  /**
   * initialize the module.
   */
  static initialize(business_id) {
    this.#business_id = business_id

    const urlSearchParams = new URLSearchParams(window.location.search)
    const session = urlSearchParams.get('hello_session') || getCookieValue('hello_session')

    if (session) {
      this.#_session = session
      this.setSessionCookie(session)
    }
  }

  /**
   *
   * @param { String } action a valid action name
   * @param { Object } params
   * @param { String } url optional url, the url is automatically inferred when the action is tracked
   * @returns {Promise}
   */
  static async track(action, params, url = null) {
    if (this.notInitialized) { throw new NotInitializedError() }

    const response = await fetch(apiUrl + 'track/events', {
      headers: this.headers,
      method: 'post',
      body: JSON.stringify({
        session: await this.session,
        url: url || window.location.href,
        action,
        ...params,
      }),
    })

    return response.json()
  }

  /**
   *
   * @returns {Promise<any>|String}
   */
  static get session() {
    if (this.notInitialized) { throw new NotInitializedError() }

    if (this.#_session) return this.#_session

    return this.mintAnonymousSession()
      .then(response => {
        this.#_session = response.id
        this.setSessionCookie(response.id)
      })
      .then(() => this.#_session)
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

  static setSessionCookie(session) {
    if (this.notInitialized) { throw new NotInitializedError() }

    document.cookie = `hello_session=${session}`
  }

  static get notInitialized() {
    return this.#business_id === undefined
  }
}

const getCookieValue = name => document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()

export default Hellotext
