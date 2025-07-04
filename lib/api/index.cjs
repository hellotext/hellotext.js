"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Response", {
  enumerable: true,
  get: function () {
    return _response.Response;
  }
});
exports.default = void 0;
var _businesses = _interopRequireDefault(require("./businesses"));
var _events = _interopRequireDefault(require("./events"));
var _forms = _interopRequireDefault(require("./forms"));
var _webchats = _interopRequireDefault(require("./webchats"));
var _response = require("./response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let API = /*#__PURE__*/function () {
  function API() {
    _classCallCheck(this, API);
  }
  _createClass(API, null, [{
    key: "businesses",
    get: function () {
      return _businesses.default;
    }
  }, {
    key: "events",
    get: function () {
      return _events.default;
    }
  }, {
    key: "forms",
    get: function () {
      return _forms.default;
    }
  }, {
    key: "webchats",
    get: function () {
      return _webchats.default;
    }
  }]);
  return API;
}();
exports.default = API;