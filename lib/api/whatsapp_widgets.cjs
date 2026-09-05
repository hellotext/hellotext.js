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
let WhatsAppWidgetsAPI = /*#__PURE__*/function () {
  function WhatsAppWidgetsAPI() {
    _classCallCheck(this, WhatsAppWidgetsAPI);
  }
  _createClass(WhatsAppWidgetsAPI, null, [{
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
  return WhatsAppWidgetsAPI;
}();
var _default = WhatsAppWidgetsAPI;
exports.default = _default;