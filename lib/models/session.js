import { Configuration } from '../core';
import { Cookies } from './cookies';
import { Page } from './page';
import { Query } from './query';
import API from '../api';
class Session {
  static #session;
  static #query;
  static #page;
  static get session() {
    return this.#session;
  }
  static get ackPayload() {
    return {
      utm_params: this.#page?.utmParams || {}
    };
  }
  static set session(value) {
    const oldSession = Cookies.get('hello_session');
    this.#session = value;
    Cookies.set('hello_session', value);
    if (oldSession !== value) {
      Cookies.delete('hello_session_ack_at');
    }
    if (!Cookies.get('hello_session_ack_at')) {
      API.acks.send(this.ackPayload);
      Cookies.set('hello_session_ack_at', new Date().toISOString());
    }
    return this.#session;
  }
  static initialize(page = new Page()) {
    this.#page = page;
    this.#query = new Query();
    const session = this.#query.session || Configuration.session || Cookies.get('hello_session');
    if (session) {
      this.session = session;
    } else if (Configuration.autoGenerateSession) {
      this.session = crypto.randomUUID();
    } else {
      this.#session = undefined;
    }
  }
}
export { Session };