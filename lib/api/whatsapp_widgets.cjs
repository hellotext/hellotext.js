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
let WhatsAppWidgetsAPI = /*#__PURE__*/function () {
  function WhatsAppWidgetsAPI() {
    _classCallCheck(this, WhatsAppWidgetsAPI);
  }
  return _createClass(WhatsAppWidgetsAPI, null, [{
    key: "endpoint",
    get: function () {
      return _core.Configuration.endpoint('public/widgets/whatsapp');
    }
  }, {
    key: "get",
    value: async function get(id) {
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
  }, {
    key: "appendWhatsAppOverrides",
    value: function appendWhatsAppOverrides(url) {
      var _appearance$launcher;
      const {
        appearance,
        body,
        number
      } = _core.Configuration.whatsapp;
      this.appendIfSupplied(url, 'whatsapp[appearance][launcher][icon_url]', (_appearance$launcher = appearance.launcher) === null || _appearance$launcher === void 0 ? void 0 : _appearance$launcher.iconUrl);
      this.appendIfSupplied(url, 'whatsapp[number]', number);
      this.appendIfSupplied(url, 'whatsapp[body]', body);
    }
  }, {
    key: "appendIfSupplied",
    value: function appendIfSupplied(url, key, value) {
      if (value === undefined || value === null) return;
      url.searchParams.append(key, String(value));
    }
  }, {
    key: "fetchWidget",
    value: async function fetchWidget(url) {
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
  }, {
    key: "parseWidgetResponse",
    value: async function parseWidgetResponse(response) {
      try {
        return await response.json();
      } catch (_) {
        return null;
      }
    }
  }]);
}();
var _default = exports.default = WhatsAppWidgetsAPI;