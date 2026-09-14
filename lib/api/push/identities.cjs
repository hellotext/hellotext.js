"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hellotext = _interopRequireDefault(require("../../hellotext"));
var _core = require("../../core");
var _response = require("../response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class PushIdentitiesAPI {
  static get endpoint() {
    return _core.Configuration.endpoint('public/push/identities');
  }
  static async create(data = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      keepalive: true,
      headers: _hellotext.default.headers,
      body: JSON.stringify({
        ...data,
        session: _hellotext.default.session,
        origin: window.location.origin
      })
    });
    return new _response.Response(response.ok, response);
  }
  static async destroy(data = {}) {
    const response = await fetch(this.endpoint, {
      method: 'DELETE',
      keepalive: true,
      headers: _hellotext.default.headers,
      body: JSON.stringify({
        ...data,
        session: _hellotext.default.session,
        origin: window.location.origin
      })
    });
    return new _response.Response(response.ok, response);
  }
}
var _default = PushIdentitiesAPI;
exports.default = _default;