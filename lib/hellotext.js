import { Configuration, Event } from './core';
import API, { Response, keepaliveFor } from './api';
import { Business, Fingerprint, FormCollection, Page, Push, Query, Session, User, Webchat, WhatsAppWidget } from './models';
import { NotInitializedError } from './errors';
class Hellotext {
  static eventEmitter = new Event();
  static forms;
  static business;
  static webchat;
  static whatsapp;
  static push;

  /**
   * initialize the module.
   * @param business public business id
   * @param { Configuration } config
   */
  static async initialize(business, config = {}) {
    this.push?.dispose();
    this.push = null;
    this.business = new Business(business);
    this.page = new Page();
    Configuration.assign({
      push: {},
      ...config
    });
    Session.initialize(this.page);
    this.forms = new FormCollection();
    this.query = new Query();
    const businessData = await this.business.hydrate();
    if (config.push !== false && businessData?.push?.public_key && Push.supported) {
      this.push = new Push(businessData.push);
      this.push.initialize().catch(error => {
        console.warn('Hellotext Push initialization failed:', error);
      });
    }
    const webchatConfig = config.webchat === false ? false : this.mergeWebchatConfig(businessData && businessData.webchat || {}, config.webchat || {});
    const whatsappConfig = config.whatsappWidget === false ? false : this.mergeWhatsAppConfig(businessData && businessData.whatsapp || {}, config.whatsappWidget || {});
    const hasExplicitBehaviourOverride = config.webchat && config.webchat !== false && Object.prototype.hasOwnProperty.call(config.webchat, 'behaviour');
    Configuration.webchat.behaviourOverride = hasExplicitBehaviourOverride;
    if (webchatConfig && webchatConfig.id) {
      Configuration.webchat.assign(webchatConfig);
      this.webchat = await Webchat.load(webchatConfig.id);
    }
    if (whatsappConfig && whatsappConfig.id) {
      Configuration.whatsapp.assign(whatsappConfig);
      this.whatsapp = await WhatsAppWidget.load(whatsappConfig.id);
    }
    if (typeof MutationObserver !== 'undefined') {
      this.forms.collectExistingFormsOnPage();
    }
  }
  static mergeWebchatConfig(dashboardConfig, localConfig) {
    return this.deepMergePlainObjects(dashboardConfig, localConfig);
  }
  static mergeWhatsAppConfig(dashboardConfig, localConfig) {
    return this.deepMergePlainObjects(dashboardConfig, localConfig);
  }
  static deepMergePlainObjects(base, override) {
    const result = {
      ...base
    };
    Object.entries(override).forEach(([key, value]) => {
      if (this.isPlainObject(value) && this.isPlainObject(result[key])) {
        result[key] = this.deepMergePlainObjects(result[key], value);
      } else {
        result[key] = value;
      }
    });
    return result;
  }
  static isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Tracks an action that has happened on the page
   *
   * @param { String } action a valid action name
   * @param { Object } params
   * @returns {Promise<Response>}
   */
  static async track(action, params = {}) {
    if (this.notInitialized) {
      throw new NotInitializedError();
    }
    const headers = {
      ...(params && params.headers || {}),
      ...this.headers
    };
    const user_parameters = {
      ...User.identificationData,
      ...(params.user_parameters || {})
    };
    const pageInstance = params && params.url ? new Page(params.url) : this.page;
    const body = {
      session: this.session,
      user_parameters,
      action,
      ...params,
      ...pageInstance.trackingData
    };
    delete body.headers;
    return await API.events.create({
      headers,
      body,
      // Track is the SDK's unload-sensitive analytics path. Keepalive belongs
      // here rather than on identify/forms/webchat calls because event tracking
      // is allowed to be fire-and-navigate, while those other calls have
      // stronger request/response or interaction contracts.
      keepalive: keepaliveFor(body)
    });
  }

  /**
   * @typedef { Object } IdentificationOptions
   * @property { String } [email] - the email of the user
   * @property { String } [phone] - the phone number of the user
   * @property { String } [name] - the name of the user
   * @property { String } [source] - the platform specific identifier where this pixel is running on.
   *
   * Identifies a user and attaches the hello_session to the user ID.
   * Repeated calls are skipped only when the last successful identify payload
   * for the current session remains unchanged.
   * @param { String } externalId - the user ID
   * @param { IdentificationOptions } options - the options for the identification
   * @returns {Promise<Response>}
   */
  static async identify(externalId, options = {}) {
    const fingerprint = await Fingerprint.generate(this.session, externalId, options);
    if (Fingerprint.matches(User.fingerprint, fingerprint)) {
      return new Response(true, {
        json: async () => ({
          already_identified: true
        })
      });
    }
    const response = await API.identifications.create({
      user_id: externalId,
      ...options
    });
    if (response.succeeded) {
      User.remember(externalId, options.source, fingerprint);
    }
    return response;
  }

  /**
   * Clears the user session, use when the user logs out to clear the hello cookies
   *
   * @returns {void}
   */
  static forget() {
    User.forget();
  }

  /**
   * Registers an event listener
   * @param event the name of the event to listen to
   * @param callback the callback. This method will be called with the payload
   */
  static on(event, callback) {
    this.eventEmitter.addSubscriber(event, callback);
  }

  /**
   * Removes an event listener
   * @param event the name of the event to remove
   * @param callback the callback to remove
   */
  static removeEventListener(event, callback) {
    this.eventEmitter.removeSubscriber(event, callback);
  }

  /**
   *
   * @returns {String}
   */
  static get session() {
    return Session.session;
  }

  /**
   * Determines if the session is set or not
   * @returns {boolean}
   */
  static get isInitialized() {
    return Session.session !== undefined;
  }

  // private

  static get notInitialized() {
    return !this.business || this.business.id === undefined;
  }
  static get headers() {
    if (this.notInitialized) {
      throw new NotInitializedError();
    }
    return {
      Authorization: `Bearer ${this.business.id}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
  }
}
export default Hellotext;