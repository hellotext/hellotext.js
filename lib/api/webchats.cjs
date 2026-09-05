"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _hellotext = _interopRequireDefault(require("../hellotext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let WebchatsAPI = /*#__PURE__*/function () {
  function WebchatsAPI() {
    _classCallCheck(this, WebchatsAPI);
  }
  _createClass(WebchatsAPI, null, [{
    key: "endpoint",
    get: function () {
      return _core.Configuration.endpoint('public/webchats');
    }
  }, {
    key: "get",
    value: async function get(id) {
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
  }, {
    key: "appendWebchatOverrides",
    value: function appendWebchatOverrides(url) {
      var _appearance$header, _appearance$launcher;
      const {
        appearance,
        whatsapp
      } = _core.Configuration.webchat;
      this.appendIfSupplied(url, 'webchat[appearance][header][name]', (_appearance$header = appearance.header) === null || _appearance$header === void 0 ? void 0 : _appearance$header.name);
      this.appendIfSupplied(url, 'webchat[appearance][launcher][icon_url]', (_appearance$launcher = appearance.launcher) === null || _appearance$launcher === void 0 ? void 0 : _appearance$launcher.iconUrl);
      this.appendIfSupplied(url, 'webchat[handoff][identifier]', whatsapp.number);
      this.appendIfSupplied(url, 'webchat[handoff][restrict_to_channel]', whatsapp.restrictToChannel);
    }
  }, {
    key: "appendIfSupplied",
    value: function appendIfSupplied(url, key, value) {
      if (value === undefined || value === null) return;
      url.searchParams.append(key, String(value));
    }
  }]);
  return WebchatsAPI;
}();
var _default = WebchatsAPI;
exports.default = _default;