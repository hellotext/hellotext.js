import axios from 'axios'

const apiUrl = 'https://api.hellotext.com/v1/'

class Hellotext {
  /**
   * initialize the module.
   */
  static initialize(business_id) {
    this.business_id = business_id

    const urlSearchParams = new URLSearchParams(window.location.search)
    const session = urlSearchParams.get('hello_session') || getCookieValue('hello_session')

    if (session) {
      this._session = session
      this.setSessionCookie(session)
    } else {
      this.mintAnonymousSession().then(response => {
        this._session = response.data
        this.setSessionCookie(response.data)
      })
    }
  }

  /**
   *
   * @param { String } action a valid action name
   * @param { Object } params
   * @param { String } url optional url, the url is automatically inferred when the action is tracked
   * @returns {Promise}
   */
  static track(action, params, url = null) {
    return axios.post(
      apiUrl + 'track/events',
      {
        session: this.session,
        url: url || window.location.href,
        action,
        ...params,
      },
      {
        headers: {
          Authorization: `Bearer ${this.business_id}`,
        },
      },
    )
  }

  static get session() {
    if (this._session) return this._session

    return this.mintAnonymousSession().then(response => {
      this._session = response.data
      return response.data
    })
  }

  // private

  static mintAnonymousSession() {
    const trackingUrl = apiUrl + 'track/sessions'

    this.mintingPromise = axios.post(
      trackingUrl,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.business_id}`,
        },
      },
    )

    return this.mintingPromise
  }

  static setSessionCookie(session) {
    document.cookie = `hello_session=${session}`
  }
}

const getCookieValue = name => document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop()

export default Hellotext
