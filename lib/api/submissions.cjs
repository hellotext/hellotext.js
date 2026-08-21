"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _core = require("../core");
var _response = require("./response");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let SubmissionsAPI = /*#__PURE__*/function () {
  function SubmissionsAPI() {
    _classCallCheck(this, SubmissionsAPI);
  }
  return _createClass(SubmissionsAPI, null, [{
    key: "endpoint",
    get: function () {
      return _core.Configuration.endpoint('public/submissions');
    }
  }, {
    key: "resendOTP",
    value: async function resendOTP(id) {
      const response = await fetch(`${this.endpoint}/${id}/otps`, {
        method: 'POST',
        headers: _hellotext.default.headers
      });
      return new _response.Response(response.ok, response);
    }
  }, {
    key: "verifyOTP",
    value: async function verifyOTP(id, otp) {
      const response = await fetch(`${this.endpoint}/${id}/otps/${otp}/verify`, {
        method: 'POST',
        headers: _hellotext.default.headers
      });
      return new _response.Response(response.ok, response);
    }
  }]);
}();
var _default = exports.default = SubmissionsAPI;