import { Configuration } from '../core'
import { Cookies } from './cookies'
import { Query } from './query'

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

    this.session = Configuration.session || this.#query.session || Cookies.get('hello_session')

    if (!this.session && Configuration.autoGenerateSession) {
      this.session = crypto.randomUUID()
    }
  }
}

export { Session }
