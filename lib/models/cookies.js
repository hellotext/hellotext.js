function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import Hellotext from '../hellotext';
import { Page } from './page';
var Cookies = /*#__PURE__*/function () {
  function Cookies() {
    _classCallCheck(this, Cookies);
  }
  return _createClass(Cookies, null, [{
    key: "set",
    value: function set(name, value) {
      if (typeof document !== 'undefined') {
        var secure = window.location.protocol === 'https:' ? '; Secure' : '';
        var domain = Page.getRootDomain();
        var maxAge = 10 * 365 * 24 * 60 * 60; // 10 years in seconds

        if (domain) {
          document.cookie = "".concat(name, "=").concat(value, "; path=/").concat(secure, "; domain=").concat(domain, "; max-age=").concat(maxAge, "; SameSite=Lax");
        } else {
          document.cookie = "".concat(name, "=").concat(value, "; path=/").concat(secure, "; max-age=").concat(maxAge, "; SameSite=Lax");
        }
      }
      if (name === 'hello_session') {
        Hellotext.eventEmitter.dispatch('session-set', value);
      }
      if (name === 'hello_utm') {
        Hellotext.eventEmitter.dispatch('utm-set', value);
      }
      return value;
    }
  }, {
    key: "get",
    value: function get(name) {
      if (typeof document !== 'undefined') {
        var _document$cookie$matc;
        return (_document$cookie$matc = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')) === null || _document$cookie$matc === void 0 ? void 0 : _document$cookie$matc.pop();
      } else {
        return undefined;
      }
    }
  }, {
    key: "delete",
    value: function _delete(name) {
      if (typeof document !== 'undefined') {
        var domain = Page.getRootDomain();
        var secure = window.location.protocol === 'https:' ? '; Secure' : '';
        if (domain) {
          document.cookie = "".concat(name, "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT").concat(secure, "; domain=").concat(domain, "; SameSite=Lax");
        } else {
          document.cookie = "".concat(name, "=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT").concat(secure, "; SameSite=Lax");
        }
      }
    }
  }]);
}();
export { Cookies };