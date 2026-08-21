function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldLooseBase(e, t) { if (!{}.hasOwnProperty.call(e, t)) throw new TypeError("attempted to use private field on non-instance"); return e; }
var id = 0;
function _classPrivateFieldLooseKey(e) { return "__private_" + id++ + "_" + e; }
import { Configuration } from '../core';
import { Cookies } from './cookies';
import { Page } from './page';
import { Query } from './query';
import API from '../api';
var _session = /*#__PURE__*/_classPrivateFieldLooseKey("session");
var _query = /*#__PURE__*/_classPrivateFieldLooseKey("query");
var _page = /*#__PURE__*/_classPrivateFieldLooseKey("page");
var Session = /*#__PURE__*/function () {
  function Session() {
    _classCallCheck(this, Session);
  }
  return _createClass(Session, null, [{
    key: "session",
    get: function get() {
      return _classPrivateFieldLooseBase(this, _session)[_session];
    },
    set: function set(value) {
      var oldSession = Cookies.get('hello_session');
      _classPrivateFieldLooseBase(this, _session)[_session] = value;
      Cookies.set('hello_session', value);
      if (oldSession !== value) {
        Cookies.delete('hello_session_ack_at');
      }
      if (!Cookies.get('hello_session_ack_at')) {
        API.acks.send(this.ackPayload);
        Cookies.set('hello_session_ack_at', new Date().toISOString());
      }
      return _classPrivateFieldLooseBase(this, _session)[_session];
    }
  }, {
    key: "ackPayload",
    get: function get() {
      var _classPrivateFieldLoo;
      return {
        utm_params: ((_classPrivateFieldLoo = _classPrivateFieldLooseBase(this, _page)[_page]) === null || _classPrivateFieldLoo === void 0 ? void 0 : _classPrivateFieldLoo.utmParams) || {}
      };
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Page();
      _classPrivateFieldLooseBase(this, _page)[_page] = page;
      _classPrivateFieldLooseBase(this, _query)[_query] = new Query();
      this.session = _classPrivateFieldLooseBase(this, _query)[_query].session || Configuration.session || Cookies.get('hello_session');
      if (!this.session && Configuration.autoGenerateSession) {
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
export { Session };