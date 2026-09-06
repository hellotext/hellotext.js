"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _hellotext = _interopRequireDefault(require("../hellotext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class WebchatsAPI {
  static get endpoint() {
    return _core.Configuration.endpoint('public/webchats');
  }
  static async get(id) {
    const url = new URL(`${this.endpoint}/${id}`);
    url.searchParams.append('session', _hellotext.default.session);
    url.searchParams.append('locale', _core.Locale.toString());
    Object.entries(_core.Configuration.webchat.style).forEach(([key, value]) => {
      url.searchParams.append(`style[${key}]`, value);
    });
    this.appendWebchatOverrides(url);
    url.searchParams.append('placement', _core.Configuration.webchat.placement);
    const response = await fetch(url, {
      method: 'GET',
      headers: _hellotext.default.headers
    });
    const data = await response.json();
    if (!_hellotext.default.business.data) {
      _hellotext.default.business.setData(data.business);
      _hellotext.default.business.setLocale(data.locale);
    }
    return new DOMParser().parseFromString(data.html, 'text/html').querySelector('article');
  }
  static appendWebchatOverrides(url) {
    const {
      appearance,
      whatsapp
    } = _core.Configuration.webchat;
    this.appendIfSupplied(url, 'webchat[appearance][header][name]', appearance.header?.name);
    this.appendIfSupplied(url, 'webchat[appearance][launcher][icon_url]', appearance.launcher?.iconUrl);
    this.appendIfSupplied(url, 'webchat[handoff][identifier]', whatsapp.number);
    this.appendIfSupplied(url, 'webchat[handoff][restrict_to_channel]', whatsapp.restrictToChannel);
  }
  static appendIfSupplied(url, key, value) {
    if (value === undefined || value === null) return;
    url.searchParams.append(key, String(value));
  }
}
var _default = WebchatsAPI;
exports.default = _default;