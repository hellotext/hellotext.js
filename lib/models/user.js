function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Cookies } from './cookies';
var User = /*#__PURE__*/function () {
  function User() {
    _classCallCheck(this, User);
  }
  return _createClass(User, null, [{
    key: "id",
    get: function get() {
      return Cookies.get('hello_user_id');
    }
  }, {
    key: "source",
    get: function get() {
      return Cookies.get('hello_user_source');
    }
  }, {
    key: "fingerprint",
    get: function get() {
      return Cookies.get('hello_user_identification_hash');
    }
  }, {
    key: "remember",
    value: function remember(id, source, fingerprint) {
      if (source) {
        Cookies.set('hello_user_source', source);
      }
      if (fingerprint) {
        Cookies.set('hello_user_identification_hash', fingerprint);
      }
      Cookies.set('hello_user_id', id);
    }
  }, {
    key: "forget",
    value: function forget() {
      Cookies.delete('hello_user_id');
      Cookies.delete('hello_user_source');
      Cookies.delete('hello_user_identification_hash');
    }
  }, {
    key: "identificationData",
    get: function get() {
      if (!this.id) return {};
      return {
        id: this.id,
        source: this.source
      };
    }
  }]);
}();
export { User };