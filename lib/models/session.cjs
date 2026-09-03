"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Session = void 0;
var _core = require("../core");
var _cookies = require("./cookies");
var _page2 = require("./page");
var _query2 = require("./query");
var _api = _interopRequireDefault(require("../api"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldLooseBase(e, t) { if (!{}.hasOwnProperty.call(e, t)) throw new TypeError("attempted to use private field on non-instance"); return e; }
var id = 0;
function _classPrivateFieldLooseKey(e) { return "__private_" + id++ + "_" + e; }
var _session = /*#__PURE__*/_classPrivateFieldLooseKey("session");
var _query = /*#__PURE__*/_classPrivateFieldLooseKey("query");
var _page = /*#__PURE__*/_classPrivateFieldLooseKey("page");
let Session = exports.Session = /*#__PURE__*/function () {
  function Session() {
    _classCallCheck(this, Session);
  }
  return _createClass(Session, null, [{
    key: "session",
    get: function () {
      return _classPrivateFieldLooseBase(this, _session)[_session];
    },
    set: function (value) {
      const oldSession = _cookies.Cookies.get('hello_session');
      _classPrivateFieldLooseBase(this, _session)[_session] = value;
      _cookies.Cookies.set('hello_session', value);
      if (oldSession !== value) {
        _cookies.Cookies.delete('hello_session_ack_at');
      }
      if (!_cookies.Cookies.get('hello_session_ack_at')) {
        _api.default.acks.send(this.ackPayload);
        _cookies.Cookies.set('hello_session_ack_at', new Date().toISOString());
      }
      return _classPrivateFieldLooseBase(this, _session)[_session];
    }
  }, {
    key: "ackPayload",
    get: function () {
      var _classPrivateFieldLoo;
      return {
        utm_params: ((_classPrivateFieldLoo = _classPrivateFieldLooseBase(this, _page)[_page]) === null || _classPrivateFieldLoo === void 0 ? void 0 : _classPrivateFieldLoo.utmParams) || {}
      };
    }
  }, {
    key: "initialize",
    value: function initialize(page = new _page2.Page()) {
      _classPrivateFieldLooseBase(this, _page)[_page] = page;
      _classPrivateFieldLooseBase(this, _query)[_query] = new _query2.Query();
      this.session = _classPrivateFieldLooseBase(this, _query)[_query].session || _core.Configuration.session || _cookies.Cookies.get('hello_session');
      if (!this.session && _core.Configuration.autoGenerateSession) {
        this.session = crypto.randomUUID();
      }
    }
  }]);
}();
Object.defineProperty(Session, _session, {
  writable: true,
  value: void 0
});
Object.defineProperty(Session, _query, {
  writable: true,
  value: void 0
});
Object.defineProperty(Session, _page, {
  writable: true,
  value: void 0
});