"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WhatsAppWidget = void 0;
var _core = require("../core");
var _api = _interopRequireDefault(require("../api"));
var _business = require("./business");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let WhatsAppWidget = /*#__PURE__*/function () {
  function WhatsAppWidget(data) {
    _classCallCheck(this, WhatsAppWidget);
    this.data = data;
    this.mounted = false;
    this.rendered = Promise.resolve(false);
  }
  _createClass(WhatsAppWidget, [{
    key: "render",
    value: async function render() {
      if (!this.data.html) return false;
      const container = this.containerToAppendTo;
      if (!container) {
        console.warn(`Hellotext WhatsApp widget was not mounted because the container ${_core.Configuration.whatsapp.container} was not found.`);
        return false;
      }
      if (!(await this.stylesheetLoaded)) {
        console.warn('Hellotext WhatsApp widget was not mounted because its stylesheet failed to load.');
        return false;
      }
      container.appendChild(this.data.html);
      this.markCoexistingWidgets();
      this.mounted = true;
      return true;
    }
  }, {
    key: "containerToAppendTo",
    get: function () {
      try {
        return document.querySelector(_core.Configuration.whatsapp.container);
      } catch (_) {
        return null;
      }
    }
  }, {
    key: "stylesheetLoaded",
    get: function () {
      return _business.Business.waitForStylesheet(_business.Business.latestStylesheet);
    }
  }, {
    key: "markCoexistingWidgets",
    value: function markCoexistingWidgets() {
      const webchat = document.querySelector('.hellotext--webchat:not(.hellotext--whatsapp-widget)');
      const whatsapp = this.data.html;
      if (!webchat || !whatsapp) return;
      webchat.classList.add('hellotext--with-whatsapp-widget');
      whatsapp.classList.add('hellotext--with-webchat');
    }
  }], [{
    key: "load",
    value: async function load(id) {
      const widget = new WhatsAppWidget({
        id,
        html: await _api.default.whatsappWidgets.get(id)
      });
      widget.rendered = widget.render();
      return widget;
    }
  }]);
  return WhatsAppWidget;
}();
exports.WhatsAppWidget = WhatsAppWidget;