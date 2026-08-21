"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UTM = void 0;
var _cookies = require("./cookies");
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let UTM = exports.UTM = /*#__PURE__*/function () {
  function UTM() {
    _classCallCheck(this, UTM);
    const urlSearchParams = new URLSearchParams(window.location.search);
    const utmsFromUrl = {
      source: urlSearchParams.get('utm_source'),
      medium: urlSearchParams.get('utm_medium'),
      campaign: urlSearchParams.get('utm_campaign'),
      term: urlSearchParams.get('utm_term'),
      content: urlSearchParams.get('utm_content')
    };
    this.save(utmsFromUrl);
  }
  return _createClass(UTM, [{
    key: "save",
    value: function save(utmParams) {
      if (!utmParams.source || !utmParams.medium) return;
      const cleanUtms = Object.fromEntries(Object.entries(utmParams).filter(([_, value]) => value));
      cleanUtms.observed_at = new Date().toISOString();
      _cookies.Cookies.set('hello_utm', JSON.stringify(cleanUtms));
    }
  }, {
    key: "current",
    get: function () {
      try {
        return JSON.parse(_cookies.Cookies.get('hello_utm')) || {};
      } catch (e) {
        return {};
      }
    }
  }]);
}();