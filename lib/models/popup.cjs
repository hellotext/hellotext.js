"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Popup = void 0;
var _core = require("../core");
var _api = _interopRequireDefault(require("../api"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let Popup = /*#__PURE__*/function () {
  function Popup(data) {
    _classCallCheck(this, Popup);
    this.data = data;
    this.mounted = false;
    this.rendered = Promise.resolve(false);
  }
  _createClass(Popup, [{
    key: "render",
    value: async function render() {
      if (!this.data.html) return false;
      const container = this.containerToAppendTo;
      if (!container) {
        console.warn(`Hellotext popup was not mounted because the container ${_core.Configuration.popup.container} was not found.`);
        return false;
      }
      container.appendChild(this.data.html);
      this.mounted = true;
      return true;
    }
  }, {
    key: "containerToAppendTo",
    get: function () {
      try {
        return document.querySelector(_core.Configuration.popup.container);
      } catch (_) {
        return null;
      }
    }
  }], [{
    key: "load",
    value: async function load(id) {
      const popup = new Popup({
        id,
        html: await _api.default.popups.get(id)
      });
      popup.rendered = popup.render();
      return popup;
    }
  }]);
  return Popup;
}();
exports.Popup = Popup;