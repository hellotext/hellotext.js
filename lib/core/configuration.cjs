"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Configuration = void 0;
var _forms = require("./configuration/forms");
var _locale = require("./configuration/locale");
var _webchat = require("./configuration/webchat");
var _whatsapp = require("./configuration/whatsapp");
var _push = require("./configuration/push");
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
  static forms = _forms.Forms;
  static webchat = _webchat.Webchat;
  static whatsapp = _whatsapp.WhatsApp;
  static push = _push.Push;

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
          this.forms = _forms.Forms.assign(value);
        } else if (key === 'webchat') {
          this.webchat = _webchat.Webchat.assign(value);
        } else if (key === 'whatsappWidget') {
          this.whatsapp = _whatsapp.WhatsApp.assign(value);
        } else if (key === 'push') {
          this.push = _push.Push.assign(value);
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
    _locale.Locale.identifier = locale;
  }
  static get locale() {
    return _locale.Locale.toString();
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
exports.Configuration = Configuration;