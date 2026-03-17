import { Configuration } from '../core'
import { Cookies } from './cookies'
import { Query } from './query'
import API from '../api'

class Session {
  static #session
  static #query

  static get session() {
    return this.#session
  }

  static set session(value) {
    const oldSession = Cookies.get('hello_session')

    this.#session = value
    Cookies.set('hello_session', value)

    if (oldSession !== value) {
      Cookies.delete('hello_session_ack_at')
    }

    if (!Cookies.get('hello_session_ack_at')) {
      API.acks.send()
      Cookies.set('hello_session_ack_at', new Date().toISOString())
    }

    return this.#session
  }

  static initialize() {
    this.#query = new Query()

    this.session = this.#query.session || Configuration.session || Cookies.get('hello_session')

    if (!this.session && Configuration.autoGenerateSession) {
      this.session = crypto.randomUUID()
    }
  }
}

export { Session }
