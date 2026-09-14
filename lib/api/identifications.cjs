"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _core = require("../core");
var _response = require("./response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class IdentificationsAPI {
  static get endpoint() {
    return _core.Configuration.endpoint('public/identifications');
  }
  static async create(data = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: _hellotext.default.headers,
      body: JSON.stringify({
        session: _hellotext.default.session,
        ...data
      })
    });
    return new _response.Response(response.ok, response);
  }
}
var _default = IdentificationsAPI;
exports.default = _default;