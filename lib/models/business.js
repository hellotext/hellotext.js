"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Business = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Business = /*#__PURE__*/function () {
  function Business(id) {
    _classCallCheck(this, Business);
    this.id = id;
    this.data = {};
    this.fetchPublicData();
  }
  _createClass(Business, [{
    key: "enabledWhitelist",
    get: function get() {
      return this.data.whitelist !== 'disabled';
    }
  }, {
    key: "fetchPublicData",
    value: function fetchPublicData() {
      fetch(_hellotext.default.__apiURL + 'public/businesses/' + this.id, {
        headers: this.headers
      }).then(response => response.json()).then(data => this.data = data);
    }
  }, {
    key: "headers",
    get: function get() {
      return {
        Authorization: "Bearer ".concat(this.id),
        Accept: 'application.json',
        'Content-Type': 'application/json'
      };
    }
  }]);
  return Business;
}();
exports.Business = Business;