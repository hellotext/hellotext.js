"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _core = require("../core");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let AcksAPI = /*#__PURE__*/function () {
  function AcksAPI() {
    _classCallCheck(this, AcksAPI);
  }
  return _createClass(AcksAPI, null, [{
    key: "endpoint",
    get: function () {
      return _core.Configuration.endpoint('public/acks');
    }
  }, {
    key: "send",
    value: async function send(params = {}) {
      const payload = {
        ...params,
        session: _hellotext.default.session,
        at: new Date().toISOString()
      };
      fetch(this.endpoint, {
        method: 'POST',
        headers: _hellotext.default.headers,
        body: JSON.stringify(payload),
        keepalive: true
      });
    }
  }]);
}();
var _default = exports.default = AcksAPI;