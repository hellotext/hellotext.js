"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UTM = void 0;
var _cookies = require("./cookies");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let UTM = /*#__PURE__*/function () {
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
    if (utmsFromUrl.source && utmsFromUrl.medium) {
      const cleanUtms = Object.fromEntries(Object.entries(utmsFromUrl).filter(([_, value]) => value));
      _cookies.Cookies.set('hello_utm', JSON.stringify(cleanUtms));
    }
  }
  _createClass(UTM, [{
    key: "current",
    get: function () {
      try {
        return JSON.parse(_cookies.Cookies.get('hello_utm')) || {};
      } catch (e) {
        return {};
      }
    }
  }]);
  return UTM;
}();
exports.UTM = UTM;