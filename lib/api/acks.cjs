"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _core = require("../core");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class AcksAPI {
  static get endpoint() {
    return _core.Configuration.endpoint('public/acks');
  }
  static async send(params = {}) {
    const payload = {
      ...params,
      session: _hellotext.default.session,
      at: new Date().toISOString()
    };
    fetch(this.endpoint, {
      method: 'POST',
      headers: _hellotext.default.headers,
      body: JSON.stringify(payload),
      keepalive: true
    });
  }
}
var _default = exports.default = AcksAPI;