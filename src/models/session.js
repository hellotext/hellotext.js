import {Configuration} from '../core';
import {Cookies, Query} from './index'

class Session {
  static #session
  static #query

  static get session() {
    return this.#session
  }

  static set session(value) {
    this.#session = value
    Cookies.set('hello_session', value)
  }

  static initialize() {
    this.#query = new Query()

    if (Configuration.session) {
      this.session = Configuration.session
    } else if (this.#query.session) {
      this.session = this.#query.session
    } else if (Cookies.get('hello_session')) {
      this.session = Cookies.get('hello_session')
    } else if (Configuration.autoGenerateSession) {
      this.session = crypto.randomUUID()
    }
  }
}

export {Session}
