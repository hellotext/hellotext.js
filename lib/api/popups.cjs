"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _response = require("./response");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let PopupsAPI = /*#__PURE__*/function () {
  function PopupsAPI() {
    _classCallCheck(this, PopupsAPI);
  }
  return _createClass(PopupsAPI, null, [{
    key: "endpoint",
    get: function () {
      return _core.Configuration.endpoint('public/popups');
    }
  }, {
    key: "get",
    value: async function get(id) {
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
  }, {
    key: "submit",
    value: async function submit(id, data) {
      const response = await fetch(`${this.endpoint}/${id}/submissions`, {
        method: 'POST',
        headers: _hellotext.default.headers,
        body: JSON.stringify({
          session: _hellotext.default.session,
          popup_submission: data
        })
      });
      return new _response.Response(response.ok, response);
    }
  }, {
    key: "fetchPopup",
    value: async function fetchPopup(url) {
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
    key: "runtimeDevice",
    get: function () {
      if (_core.Configuration.popup.device !== 'auto') return _core.Configuration.popup.device;
      return window.innerWidth <= 767 ? 'mobile' : 'desktop';
    }
  }, {
    key: "parsePopupResponse",
    value: async function parsePopupResponse(response) {
      try {
        return await response.json();
      } catch (_) {
        return null;
      }
    }
  }]);
}();
var _default = exports.default = PopupsAPI;