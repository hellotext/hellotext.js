"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Webchat = void 0;
var _core = require("../core");
var _api = _interopRequireDefault(require("../api"));
var _business = require("./business");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class Webchat {
  static async load(id) {
    const webchat = new Webchat({
      id,
      html: await _api.default.webchats.get(id)
    });
    webchat.rendered = webchat.render();
    return webchat;
  }
  constructor(data) {
    this.data = data;
    this.mounted = false;
    this.rendered = Promise.resolve(false);
  }
  async render() {
    this.applyBehaviourOverride();
    if (!(await this.stylesheetLoaded)) {
      console.warn('Hellotext webchat was not mounted because its stylesheet failed to load.');
      return false;
    }
    this.containerToAppendTo.appendChild(this.data.html);
    this.markCoexistingWidgets();
    this.mounted = true;
    return true;
  }
  applyBehaviourOverride() {
    if (!_core.Configuration.webchat.hasBehaviourOverride || !_core.Configuration.webchat.behaviour) return;
    this.data.html.setAttribute('data-hellotext--webchat-behaviour-value', JSON.stringify(this.serializedBehaviour));
  }
  get serializedBehaviour() {
    const behaviour = _core.Configuration.webchat.behaviour;
    return {
      trigger: this.serializeTrigger(behaviour.trigger),
      delay_seconds: behaviour.delaySeconds,
      first_visit_only: behaviour.firstVisitOnly,
      once_per_session: behaviour.oncePerSession
    };
  }
  serializeTrigger(trigger) {
    if (trigger === 'onLoad') return 'on_load';
    if (trigger === 'onClick') return 'on_click';
    return trigger;
  }
  get containerToAppendTo() {
    return document.querySelector(_core.Configuration.webchat.container);
  }
  get stylesheetLoaded() {
    return _business.Business.waitForStylesheet(_business.Business.latestStylesheet);
  }
  markCoexistingWidgets() {
    const webchat = this.data.html;
    const whatsapp = document.querySelector('.hellotext--whatsapp-widget');
    if (!webchat || !whatsapp) return;
    webchat.classList.add('hellotext--with-whatsapp-widget');
    whatsapp.classList.add('hellotext--with-webchat');
  }
}
exports.Webchat = Webchat;