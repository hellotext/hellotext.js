function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { Cookies } from './cookies';
var Query = /*#__PURE__*/function () {
  function Query() {
    _classCallCheck(this, Query);
    this.urlSearchParams = new URLSearchParams(window.location.search);
  }
  _createClass(Query, [{
    key: "get",
    value: function get(param) {
      return this.urlSearchParams.get(this.toHellotextParam(param));
    }
  }, {
    key: "has",
    value: function has(param) {
      return this.urlSearchParams.has(this.toHellotextParam(param));
    }
  }, {
    key: "inPreviewMode",
    get: function get() {
      return this.has('preview');
    }
  }, {
    key: "session",
    get: function get() {
      return this.get('session') || Cookies.get('hello_session');
    }
  }, {
    key: "toHellotextParam",
    value: function toHellotextParam(param) {
      return "hello_".concat(param);
    }
  }], [{
    key: "inPreviewMode",
    get: function get() {
      return new this().inPreviewMode;
    }
  }]);
  return Query;
}();
export { Query };