"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Webchat = void 0;
var _core = require("../core");
var _api = _interopRequireDefault(require("../api"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let Webchat = /*#__PURE__*/function () {
  function Webchat(data) {
    _classCallCheck(this, Webchat);
    this.data = data;
    this.render();
  }
  _createClass(Webchat, [{
    key: "render",
    value: function render() {
      this.containerToAppendTo.appendChild(this.data.html);
    }
  }, {
    key: "containerToAppendTo",
    get: function () {
      return document.querySelector(_core.Configuration.webchat.container);
    }
  }], [{
    key: "load",
    value: async function load(id) {
      return new Webchat({
        id,
        html: await _api.default.webchats.get(id)
      });
    }
  }]);
  return Webchat;
}();
exports.Webchat = Webchat;