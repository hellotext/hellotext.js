"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Cookies = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _page = require("./page");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let Cookies = /*#__PURE__*/function () {
  function Cookies() {
    _classCallCheck(this, Cookies);
  }
  _createClass(Cookies, null, [{
    key: "set",
    value: function set(name, value) {
      if (typeof document !== 'undefined') {
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        const domain = _page.Page.getRootDomain();
        const maxAge = 10 * 365 * 24 * 60 * 60; // 10 years in seconds

        if (domain) {
          document.cookie = `${name}=${value}; path=/${secure}; domain=${domain}; max-age=${maxAge}; SameSite=Lax`;
        } else {
          document.cookie = `${name}=${value}; path=/${secure}; max-age=${maxAge}; SameSite=Lax`;
        }
      }
      if (name === 'hello_session') {
        _hellotext.default.eventEmitter.dispatch('session-set', value);
      }
      if (name === 'hello_utm') {
        _hellotext.default.eventEmitter.dispatch('utm-set', value);
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
        const domain = _page.Page.getRootDomain();
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        if (domain) {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}; domain=${domain}; SameSite=Lax`;
        } else {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}; SameSite=Lax`;
        }
      }
    }
  }]);
  return Cookies;
}();
exports.Cookies = Cookies;