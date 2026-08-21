"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _hellotext = _interopRequireDefault(require("../hellotext"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let WebchatsAPI = /*#__PURE__*/function () {
  function WebchatsAPI() {
    _classCallCheck(this, WebchatsAPI);
  }
  return _createClass(WebchatsAPI, null, [{
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
}();
var _default = exports.default = WebchatsAPI;