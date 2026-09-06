"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _response = require("./response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class FormsAPI {
  static get endpoint() {
    return _core.Configuration.endpoint('public/forms');
  }
  static async get(id) {
    const url = new URL(`${this.endpoint}/${id}`);
    url.searchParams.append('session', _hellotext.default.session);
    url.searchParams.append('locale', _core.Locale.toString());
    return fetch(url, {
      method: 'GET',
      headers: _hellotext.default.headers
    });
  }
  static async submit(id, data) {
    const response = await fetch(`${this.endpoint}/${id}/submissions`, {
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
exports.default = FormsAPI;