import { Forms } from './configuration/forms';
import { Locale } from './configuration/locale';
import { Webchat } from './configuration/webchat';
import { WhatsApp } from './configuration/whatsapp';
import { Push } from './configuration/push';

/**
 * @class Configuration
 * @classdesc
 * Configuration for Hellotext
 * @property {Boolean} [autoGenerateSession=true] - whether to auto generate session or not
 * @property {String} [session] - session id
 * @property {Forms} [forms] - form configuration
 * @property {Webchat} [webchat] - webchat configuration
 * @property {WhatsApp} [whatsappWidget] - WhatsApp widget configuration
 * @property {Push} [push] - push subscription configuration
 * @property {Locale} [locale] - locale configuration
 */
class Configuration {
  static apiRoot = 'https://api.hellotext.com/v1';
  static actionCableUrl = 'wss://www.hellotext.com/cable';
  static autoGenerateSession = true;
  static session = null;
  static forms = Forms;
  static webchat = Webchat;
  static whatsapp = WhatsApp;
  static push = Push;

  /**
   *
   * @param props
   * @param {Boolean} [props.autoGenerateSession=true] - whether to auto generate session or not
   * @param {String} [props.session] - session id
   * @param {Object} [props.forms] - form configuration
   * @returns {Configuration}
   */
  static assign(props) {
    if (props) {
      const shouldInferActionCableUrl = Object.prototype.hasOwnProperty.call(props, 'apiRoot') && !Object.prototype.hasOwnProperty.call(props, 'actionCableUrl');
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'forms') {
          this.forms = Forms.assign(value);
        } else if (key === 'webchat') {
          this.webchat = Webchat.assign(value);
        } else if (key === 'whatsappWidget') {
          this.whatsapp = WhatsApp.assign(value);
        } else if (key === 'push') {
          this.push = Push.assign(value);
        } else {
          this[key] = value;
        }
      });
      if (shouldInferActionCableUrl) {
        this.actionCableUrl = this.actionCableUrlForApiRoot(this.apiRoot);
      }
    }
    return this;
  }
  static set locale(locale) {
    Locale.identifier = locale;
  }
  static get locale() {
    return Locale.toString();
  }
  static endpoint(path) {
    return `${this.apiRoot}/${path}`;
  }
  static actionCableUrlForApiRoot(apiRoot) {
    try {
      const url = new URL(apiRoot);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      url.protocol = protocol;
      url.pathname = '/cable';
      url.search = '';
      url.hash = '';
      return url.toString();
    } catch (_) {
      return this.actionCableUrl;
    }
  }
}
export { Configuration };