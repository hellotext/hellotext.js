import { Configuration, Event } from './core';
import API, { Response, keepaliveFor } from './api';
import { Alert, Business, Fingerprint, FormCollection, Page, Push, Popup, Query, Session, User, Webchat, WhatsAppWidget } from './models';
import { NotInitializedError } from './errors';
const ACTIVITY_RULE_FIELDS = {
  'product.viewed': 'activity.product_viewed',
  'cart.added': 'activity.cart_added',
  'order.placed': 'activity.purchase_completed',
  'product.purchased': 'activity.purchase_completed',
  'form.completed': 'activity.form_completed'
};
class Hellotext {
  static eventEmitter = new Event();
  static activities = new Set();
  static pageViews = 1;
  static visitorType = 'new';
  static visitBusinessId;
  static lastPageUrl;
  static forms;
  static business;
  static popup;
  static webchat;
  static whatsapp;
  static push;
  static alert;
  static initializationGeneration = 0;
  static initializationBaseline;

  /**
   * initialize the module.
   * @param business public business id
   * @param { Configuration } config
   */
  static async initialize(business, config = {}) {
    const generation = ++this.initializationGeneration;
    this.initializationBaseline ||= {
      configuration: this.configurationSnapshot(),
      runtime: this.runtimeSnapshot()
    };
    const {
      configuration,
      runtime: previous
    } = this.initializationBaseline;
    const staged = {};
    const nextBusiness = new Business(business);
    try {
      const businessData = await nextBusiness.hydrate({
        apiRoot: config.apiRoot,
        stylesheet: false
      });
      if (!this.initializationIsCurrent(generation)) return;
      if (!businessData && this.hasMountedSurfaces(previous)) {
        if (!this.hasExplicitSurface(config) && this.hasDisabledSurface(config)) {
          this.restoreRuntime(this.runtimeWithoutDisabledSurfaces(previous, config));
        } else if (!this.hasExplicitSurface(config)) {
          this.restoreRuntime(previous);
        }
        if (!this.hasExplicitSurface(config)) {
          this.restoreConfiguration(configuration);
          return;
        }
      }
      Configuration.assign({
        push: {},
        ...config
      });
      this.business = nextBusiness;
      nextBusiness.loadStylesheet();
      this.page = new Page();
      Session.initialize(this.page);
      this.initializeVisitSignals(business);
      this.forms = new FormCollection();
      this.query = new Query();
      this.popup = undefined;
      this.webchat = undefined;
      this.whatsapp = undefined;
      this.push = null;
      this.alert = null;
      if (config.push !== false && businessData?.push?.public_key && Push.supported) {
        staged.push = new Push(businessData.push);
        staged.push.initialize().catch(error => {
          console.warn('Hellotext Push initialization failed:', error);
        });
        if (businessData.alert?.html) {
          staged.alert = new Alert(businessData.alert, nextBusiness, staged.push);
        }
      }
      const popupConfig = config.popup === false ? undefined : this.popupConfig(businessData, config.popup || {});
      const webchatConfig = config.webchat === false ? false : this.mergeWebchatConfig(businessData && businessData.webchat || {}, config.webchat || {});
      const whatsappConfig = config.whatsappWidget === false ? false : this.mergeWhatsAppConfig(businessData && businessData.whatsapp || {}, config.whatsappWidget || {});
      const hasExplicitBehaviourOverride = config.webchat && config.webchat !== false && Object.prototype.hasOwnProperty.call(config.webchat, 'behaviour');
      Configuration.webchat.behaviourOverride = hasExplicitBehaviourOverride;
      if (webchatConfig && webchatConfig.id) {
        Configuration.webchat.assign(webchatConfig);
        staged.webchat = await Webchat.load(webchatConfig.id);
        if (!this.initializationIsCurrent(generation)) return;
      }
      if (whatsappConfig && whatsappConfig.id) {
        Configuration.whatsapp.assign(whatsappConfig);
        staged.whatsapp = await WhatsAppWidget.load(whatsappConfig.id);
        if (!this.initializationIsCurrent(generation)) return;
      }
      if (popupConfig) {
        Configuration.popup.assign(popupConfig);
        staged.popup = await Popup.load(popupConfig.id);
        if (!this.initializationIsCurrent(generation)) return;
      }
      this.unmountSurfaces(previous);
      this.disposePush(previous);
      previous.business?.releaseStylesheet?.();
      staged.webchat?.markCoexistingWidgets?.();
      staged.whatsapp?.markCoexistingWidgets?.();
      this.webchat = staged.webchat;
      this.whatsapp = staged.whatsapp;
      this.popup = staged.popup;
      this.push = staged.push || null;
      this.alert = staged.alert || null;
      if (typeof MutationObserver !== 'undefined') {
        this.forms.collectExistingFormsOnPage();
      }
    } catch (error) {
      this.unmountSurfaces(staged);
      this.disposePush(staged);
      nextBusiness.releaseStylesheet();
      if (this.initializationIsCurrent(generation)) {
        this.restoreRuntime(previous);
        this.restoreConfiguration(configuration);
      }
      throw error;
    } finally {
      if (!this.initializationIsCurrent(generation)) {
        this.unmountSurfaces(staged);
        this.disposePush(staged);
        nextBusiness.releaseStylesheet();
      } else {
        this.initializationBaseline = undefined;
      }
    }
  }
  static initializationIsCurrent(generation) {
    return this.initializationGeneration === generation;
  }
  static unmountSurfaces({
    popup,
    webchat,
    whatsapp
  }) {
    new Set([popup, webchat, whatsapp]).forEach(surface => surface?.unmount?.());
  }
  static disposePush({
    push,
    alert
  }) {
    alert?.dispose();
    push?.dispose();
  }
  static runtimeSnapshot() {
    return {
      business: this.business,
      page: this.page,
      forms: this.forms,
      query: this.query,
      activities: new Set(this.activities),
      pageViews: this.pageViews,
      visitorType: this.visitorType,
      visitBusinessId: this.visitBusinessId,
      lastPageUrl: this.lastPageUrl,
      popup: this.popup,
      webchat: this.webchat,
      whatsapp: this.whatsapp,
      push: this.push,
      alert: this.alert
    };
  }
  static hasExplicitSurface(config) {
    return [config.popup, config.webchat, config.whatsappWidget].some(surface => surface && surface !== false && surface.id);
  }
  static hasDisabledSurface(config) {
    return config.popup === false || config.webchat === false || config.whatsappWidget === false;
  }
  static runtimeWithoutDisabledSurfaces(previous, config) {
    const disabled = {
      popup: config.popup === false ? previous.popup : undefined,
      webchat: config.webchat === false ? previous.webchat : undefined,
      whatsapp: config.whatsappWidget === false ? previous.whatsapp : undefined
    };
    this.unmountSurfaces(disabled);
    return {
      ...previous,
      popup: config.popup === false ? undefined : previous.popup,
      webchat: config.webchat === false ? undefined : previous.webchat,
      whatsapp: config.whatsappWidget === false ? undefined : previous.whatsapp
    };
  }
  static hasMountedSurfaces({
    popup,
    webchat,
    whatsapp
  }) {
    return !!popup || !!webchat || !!whatsapp;
  }
  static restoreRuntime(snapshot) {
    Object.assign(this, snapshot);
  }
  static configurationSnapshot() {
    return {
      apiRoot: Configuration.apiRoot,
      actionCableUrl: Configuration.actionCableUrl,
      autoGenerateSession: Configuration.autoGenerateSession,
      session: Configuration.session,
      locale: Configuration.locale,
      forms: {
        autoMount: Configuration.forms.autoMount,
        successMessage: Configuration.forms.successMessage
      },
      push: {
        serviceWorkerUrl: Configuration.push.serviceWorkerUrl,
        channelId: Configuration.push.channelId
      },
      popup: {
        id: Configuration.popup.id,
        container: Configuration.popup.container,
        device: Configuration.popup.device
      },
      webchat: {
        id: Configuration.webchat.id,
        container: Configuration.webchat.container,
        placement: Configuration.webchat.placement,
        style: this.clone(Configuration.webchat.style),
        appearance: this.clone(Configuration.webchat.appearance),
        whatsapp: this.clone(Configuration.webchat.whatsapp),
        mode: Configuration.webchat.mode,
        behaviour: this.clone(Configuration.webchat.behaviour),
        behaviourOverride: Configuration.webchat.hasBehaviourOverride,
        strategy: Configuration.webchat._strategy
      },
      whatsapp: {
        id: Configuration.whatsapp.id,
        container: Configuration.whatsapp.container,
        placement: Configuration.whatsapp.placement,
        appearance: this.clone(Configuration.whatsapp.appearance),
        number: Configuration.whatsapp.number,
        body: Configuration.whatsapp.body
      }
    };
  }
  static restoreConfiguration(snapshot) {
    Configuration.apiRoot = snapshot.apiRoot;
    Configuration.actionCableUrl = snapshot.actionCableUrl;
    Configuration.autoGenerateSession = snapshot.autoGenerateSession;
    Configuration.session = snapshot.session;
    Configuration.locale = snapshot.locale;
    Configuration.forms.assign(snapshot.forms);
    Configuration.push.assign(snapshot.push);
    Configuration.popup.assign(snapshot.popup);
    Configuration.webchat.assign(snapshot.webchat);
    Configuration.webchat.behaviourOverride = snapshot.webchat.behaviourOverride;
    Configuration.whatsapp.assign(snapshot.whatsapp);
  }
  static clone(value) {
    if (Array.isArray(value)) return value.map(item => this.clone(item));
    if (!this.isPlainObject(value)) return value;
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.clone(item)]));
  }
  static mergeWebchatConfig(dashboardConfig, localConfig) {
    return this.deepMergePlainObjects(dashboardConfig, localConfig);
  }
  static mergeWhatsAppConfig(dashboardConfig, localConfig) {
    return this.deepMergePlainObjects(dashboardConfig, localConfig);
  }
  static mergePopupConfig(dashboardConfig, localConfig) {
    return this.deepMergePlainObjects(dashboardConfig, localConfig);
  }
  static popupConfig(businessData, localConfig) {
    if (localConfig.id) {
      return localConfig;
    }
    const dashboardConfig = businessData && businessData.popup;
    if (!dashboardConfig || !dashboardConfig.id) return undefined;
    return this.mergePopupConfig(dashboardConfig, localConfig);
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
    const response = await API.events.create({
      headers,
      body,
      // Track is the SDK's unload-sensitive analytics path. Keepalive belongs
      // here rather than on identify/forms/webchat calls because event tracking
      // is allowed to be fire-and-navigate, while those other calls have
      // stronger request/response or interaction contracts.
      keepalive: keepaliveFor(body)
    });
    if (response.succeeded) this.recordActivity(action);
    return response;
  }
  static recordActivity(action) {
    const field = ACTIVITY_RULE_FIELDS[action];
    if (!field) return;
    this.activities.add(field);
    this.writeStorage(window.sessionStorage, this.visitStorageKey('activities'), JSON.stringify([...this.activities]));
    this.eventEmitter.dispatch('activity:occurred', {
      action,
      field
    });
  }
  static initializeVisitSignals(businessId) {
    const businessChanged = this.visitBusinessId !== businessId;
    this.visitBusinessId = businessId;
    if (businessChanged) {
      this.activities = new Set(this.readStoredActivities());
      const storedVisitorType = this.readStorage(window.sessionStorage, this.visitStorageKey('visitor-type'));
      this.visitorType = ['new', 'returning'].includes(storedVisitorType) ? storedVisitorType : undefined;
      if (!this.visitorType) {
        this.visitorType = this.readStorage(window.localStorage, this.visitStorageKey('seen')) ? 'returning' : 'new';
        this.writeStorage(window.sessionStorage, this.visitStorageKey('visitor-type'), this.visitorType);
        this.writeStorage(window.localStorage, this.visitStorageKey('seen'), '1');
      }
    }
    if (businessChanged || this.lastPageUrl !== window.location.href) this.recordPageView();
  }
  static recordPageView() {
    const key = this.visitStorageKey('page-views');
    const stored = Number(this.readStorage(window.sessionStorage, key));
    this.pageViews = Number.isInteger(stored) && stored >= 0 ? stored + 1 : 1;
    this.lastPageUrl = window.location.href;
    this.writeStorage(window.sessionStorage, key, String(this.pageViews));
  }
  static readStoredActivities() {
    try {
      const stored = JSON.parse(this.readStorage(window.sessionStorage, this.visitStorageKey('activities')) || '[]');
      return Array.isArray(stored) ? stored.filter(field => Object.values(ACTIVITY_RULE_FIELDS).includes(field)) : [];
    } catch (_) {
      return [];
    }
  }
  static visitStorageKey(name) {
    return `hellotext:business:${this.visitBusinessId}:${name}`;
  }
  static readStorage(storage, key) {
    try {
      return storage?.getItem(key);
    } catch (_) {
      return null;
    }
  }
  static writeStorage(storage, key, value) {
    try {
      storage?.setItem(key, value);
    } catch (_) {
      // Storage may be unavailable in privacy-restricted browser contexts.
    }
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