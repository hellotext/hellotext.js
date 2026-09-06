"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _hellotext = _interopRequireDefault(require("../hellotext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class WhatsAppWidgetsAPI {
  static get endpoint() {
    return _core.Configuration.endpoint('public/widgets/whatsapp');
  }
  static async get(id) {
    const url = new URL(`${this.endpoint}/${id}`);
    url.searchParams.append('locale', _core.Locale.toString());
    url.searchParams.append('placement', _core.Configuration.whatsapp.placement);
    this.appendWhatsAppOverrides(url);
    const response = await this.fetchWidget(url);
    if (!response.ok) return null;
    const data = await this.parseWidgetResponse(response);
    if (!data) return null;
    if (!_hellotext.default.business.data) {
      _hellotext.default.business.setData(data.business);
      _hellotext.default.business.setLocale(data.locale);
    }
    return new DOMParser().parseFromString(data.html, 'text/html').querySelector('article');
  }
  static appendWhatsAppOverrides(url) {
    const {
      appearance,
      body,
      number
    } = _core.Configuration.whatsapp;
    this.appendIfSupplied(url, 'whatsapp[appearance][launcher][icon_url]', appearance.launcher?.iconUrl);
    this.appendIfSupplied(url, 'whatsapp[number]', number);
    this.appendIfSupplied(url, 'whatsapp[body]', body);
  }
  static appendIfSupplied(url, key, value) {
    if (value === undefined || value === null) return;
    url.searchParams.append(key, String(value));
  }
  static async fetchWidget(url) {
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
  static async parseWidgetResponse(response) {
    try {
      return await response.json();
    } catch (_) {
      return null;
    }
  }
}
var _default = WhatsAppWidgetsAPI;
exports.default = _default;