function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
import { Configuration } from '../core';
import { Cookies } from './cookies';
import { Query } from './query';
var _session = /*#__PURE__*/_classPrivateFieldLooseKey("session");
var _query = /*#__PURE__*/_classPrivateFieldLooseKey("query");
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
      _classPrivateFieldLooseBase(this, _session)[_session] = value;
      Cookies.set('hello_session', value);
    }
  }, {
    key: "initialize",
    value: function initialize() {
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
export { Session };