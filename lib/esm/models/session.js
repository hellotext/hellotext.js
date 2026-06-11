function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
import { Configuration } from '../core/index.js';
import { Cookies } from './cookies.js';
import { Page } from './page.js';
import { Query } from './query.js';
import API from '../api/index.js';
var _session = /*#__PURE__*/_classPrivateFieldLooseKey("session");
var _query = /*#__PURE__*/_classPrivateFieldLooseKey("query");
var _page = /*#__PURE__*/_classPrivateFieldLooseKey("page");
var Session = /*#__PURE__*/function () {
  function Session() {
    _classCallCheck(this, Session);
  }
  _createClass(Session, null, [{
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
  return Session;
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
