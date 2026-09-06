"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Session = void 0;
var _core = require("../core");
var _cookies = require("./cookies");
var _page = require("./page");
var _query = require("./query");
var _api = _interopRequireDefault(require("../api"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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
    const oldSession = _cookies.Cookies.get('hello_session');
    this.#session = value;
    _cookies.Cookies.set('hello_session', value);
    if (oldSession !== value) {
      _cookies.Cookies.delete('hello_session_ack_at');
    }
    if (!_cookies.Cookies.get('hello_session_ack_at')) {
      _api.default.acks.send(this.ackPayload);
      _cookies.Cookies.set('hello_session_ack_at', new Date().toISOString());
    }
    return this.#session;
  }
  static initialize(page = new _page.Page()) {
    this.#page = page;
    this.#query = new _query.Query();
    this.session = this.#query.session || _core.Configuration.session || _cookies.Cookies.get('hello_session');
    if (!this.session && _core.Configuration.autoGenerateSession) {
      this.session = crypto.randomUUID();
    }
  }
}
exports.Session = Session;