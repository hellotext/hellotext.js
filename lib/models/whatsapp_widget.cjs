"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WhatsAppWidget = void 0;
var _core = require("../core");
var _api = _interopRequireDefault(require("../api"));
var _business = require("./business");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class WhatsAppWidget {
  static async load(id) {
    const widget = new WhatsAppWidget({
      id,
      html: await _api.default.whatsappWidgets.get(id)
    });
    widget.rendered = widget.render();
    return widget;
  }
  constructor(data) {
    this.data = data;
    this.mounted = false;
    this.rendered = Promise.resolve(false);
  }
  async render() {
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
  get containerToAppendTo() {
    try {
      return document.querySelector(_core.Configuration.whatsapp.container);
    } catch (_) {
      return null;
    }
  }
  get stylesheetLoaded() {
    return _business.Business.waitForStylesheet(_business.Business.latestStylesheet);
  }
  markCoexistingWidgets() {
    const webchat = document.querySelector('.hellotext--webchat:not(.hellotext--whatsapp-widget)');
    const whatsapp = this.data.html;
    if (!webchat || !whatsapp) return;
    webchat.classList.add('hellotext--with-whatsapp-widget');
    whatsapp.classList.add('hellotext--with-webchat');
  }
}
exports.WhatsAppWidget = WhatsAppWidget;