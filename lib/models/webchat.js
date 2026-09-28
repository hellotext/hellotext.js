import { Configuration } from '../core';
import API from '../api';
import { Business } from './business';
class Webchat {
  static async load(id, {
    shouldMount = () => true
  } = {}) {
    const webchat = new Webchat({
      id,
      html: await API.webchats.get(id)
    }, {
      shouldMount
    });
    webchat.rendered = webchat.render();
    return webchat;
  }
  constructor(data, {
    shouldMount = () => true
  } = {}) {
    this.data = data;
    this.shouldMount = shouldMount;
    this.mounted = false;
    this.rendered = Promise.resolve(false);
  }
  async render() {
    this.applyBehaviourOverride();
    if (!this.shouldMount()) return false;
    if (!(await this.stylesheetLoaded)) {
      console.warn('Hellotext webchat was not mounted because its stylesheet failed to load.');
      return false;
    }
    if (!this.shouldMount()) return false;
    const container = this.containerToAppendTo;
    if (!container) return false;
    container.appendChild(this.data.html);
    this.markCoexistingWidgets();
    this.mounted = true;
    if (!this.shouldMount()) this.unmount();
    return this.mounted;
  }
  unmount() {
    this.data.html?.remove();
    this.mounted = false;
  }
  applyBehaviourOverride() {
    if (!Configuration.webchat.hasBehaviourOverride || !Configuration.webchat.behaviour) return;
    this.data.html.setAttribute('data-hellotext--webchat-behaviour-value', JSON.stringify(this.serializedBehaviour));
  }
  get serializedBehaviour() {
    const behaviour = Configuration.webchat.behaviour;
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
    return document.querySelector(Configuration.webchat.container);
  }
  get stylesheetLoaded() {
    return Business.waitForStylesheet(Business.latestStylesheet);
  }
  markCoexistingWidgets() {
    const webchat = this.data.html;
    const whatsapp = document.querySelector('.hellotext--whatsapp-widget');
    if (!webchat || !whatsapp) return;
    webchat.classList.add('hellotext--with-whatsapp-widget');
    whatsapp.classList.add('hellotext--with-webchat');
  }
}
export { Webchat };