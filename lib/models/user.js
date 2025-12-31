function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { Cookies } from './cookies';
var User = /*#__PURE__*/function () {
  function User() {
    _classCallCheck(this, User);
  }
  _createClass(User, null, [{
    key: "id",
    get: function get() {
      return Cookies.get('hello_identified_user_id');
    }
  }, {
    key: "source",
    get: function get() {
      return Cookies.get('hello_identified_source');
    }
  }, {
    key: "persist",
    value: function persist(id, source) {
      if (source) {
        Cookies.set('hello_identified_source', source);
      }
      Cookies.set('hello_identified_user_id', id);
    }
  }, {
    key: "forget",
    value: function forget() {
      Cookies.delete('hello_identified_user_id');
      Cookies.delete('hello_identified_source');
    }
  }, {
    key: "identificationData",
    get: function get() {
      if (!this.id) return {};
      return {
        user_id: this.id,
        source: this.source
      };
    }
  }]);
  return User;
}();
export { User };