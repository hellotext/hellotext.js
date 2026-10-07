"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _response = require("./response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class PopupsAPI {
  static get endpoint() {
    return _core.Configuration.endpoint('public/popups');
  }
  static async get(id) {
    const url = new URL(`${this.endpoint}/${id}`);
    url.searchParams.append('session', _hellotext.default.session);
    url.searchParams.append('locale', _core.Locale.toString());
    url.searchParams.append('device', this.runtimeDevice);
    const response = await this.fetchPopup(url);
    if (!response.ok) return null;
    const data = await this.parsePopupResponse(response);
    if (!data) return null;
    if (!_hellotext.default.business.data) {
      _hellotext.default.business.setData(data.business);
      _hellotext.default.business.setLocale(data.locale);
    }
    return new DOMParser().parseFromString(data.html, 'text/html').querySelector('article');
  }
  static async submit(id, data, idempotencyKey = this.idempotencyKey()) {
    const response = await fetch(`${this.endpoint}/${id}/submissions`, {
      method: 'POST',
      headers: {
        ..._hellotext.default.headers,
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        session: _hellotext.default.session,
        popup_submission: data
      })
    });
    return new _response.Response(response.ok, response);
  }
  static async resend(id, submissionId, token) {
    const response = await fetch(`${this.endpoint}/${id}/submissions/${submissionId}/resend`, {
      method: 'POST',
      headers: _hellotext.default.headers,
      body: JSON.stringify({
        token
      })
    });
    return new _response.Response(response.ok, response);
  }
  static async cancel(id, submissionId, token) {
    const response = await fetch(`${this.endpoint}/${id}/submissions/${submissionId}/cancel`, {
      method: 'POST',
      headers: _hellotext.default.headers,
      body: JSON.stringify({
        token
      })
    });
    return new _response.Response(response.ok, response);
  }
  static idempotencyKey() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  }
  static async fetchPopup(url) {
    try {
      return await fetch(url, {
        method: 'GET',
        headers: _hellotext.default.headers
      });
    } catch (_) {
      return {
        ok: false
      };
    }
  }
  static get runtimeDevice() {
    if (_core.Configuration.popup.device !== 'auto') return _core.Configuration.popup.device;
    return window.innerWidth <= 767 ? 'mobile' : 'desktop';
  }
  static async parsePopupResponse(response) {
    try {
      return await response.json();
    } catch (_) {
      return null;
    }
  }
}
var _default = PopupsAPI;
exports.default = _default;