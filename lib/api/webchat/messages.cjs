"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../../core");
var _hellotext = _interopRequireDefault(require("../../hellotext"));
var _response = require("../response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class WebchatMessagesAPI {
  static get endpoint() {
    return _core.Configuration.endpoint(`public/webchats/:id/messages`);
  }
  constructor(webchatId) {
    this.webchatId = webchatId;
  }
  async index(params) {
    const url = new URL(this.url);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    return await fetch(url, {
      method: 'GET',
      headers: _hellotext.default.headers
    });
  }
  catchUp(afterId) {
    return this.index({
      after_id: afterId,
      session: _hellotext.default.session
    });
  }
  async create(formData) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${_hellotext.default.business.id}`
      },
      body: formData
    });
    return new _response.Response(response.ok, response);
  }
  markAsSeen(messageId = null) {
    const url = messageId ? this.url + `/${messageId}` : this.url + '/seen';
    fetch(url, {
      method: 'PATCH',
      headers: _hellotext.default.headers,
      body: JSON.stringify({
        session: _hellotext.default.session
      })
    });
  }
  get url() {
    return WebchatMessagesAPI.endpoint.replace(':id', this.webchatId);
  }
}
var _default = WebchatMessagesAPI;
exports.default = _default;