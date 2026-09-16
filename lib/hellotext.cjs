"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("./core");
var _api = _interopRequireWildcard(require("./api"));
var _models = require("./models");
var _errors = require("./errors");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// The campaign parameters display rules can target. `utm_term` and `utm_content` are not
// among them, so a link carrying only those does not stand for a campaign here.
const CAMPAIGN_RULE_KEYS = ['source', 'medium', 'campaign'];
const ACTIVITY_RULE_FIELDS = {
  'product.viewed': 'activity.product_viewed',
  'cart.added': 'activity.cart_added',
  'order.placed': 'activity.purchase_completed',
  'product.purchased': 'activity.purchase_completed',
  'form.completed': 'activity.form_completed'
};
class Hellotext {
  static eventEmitter = new _core.Event();
  static activities = new Set();
  static pageViews = 1;
  static visitCampaign = {};
  static visitorType = 'new';
  static visitBusinessId;
  static lastPageUrl;
  static lastPageRoute;
  static pageStartedAt;
  static visitStartedAt;
  static forms;
  static business;
  static popup;
  static webchat;
  static whatsapp;
  static push;
  static alert;
  static initializationVersion = 0;

  /**
   * initialize the module.
   * @param business public business id
   * @param { Configuration } config
   */
  static async initialize(business, config = {}) {
    const initializationVersion = ++this.initializationVersion;
    this.popup?.unmount?.();
    this.popup = undefined;
    this.alert?.dispose();
    this.alert = null;
    this.push?.dispose();
    this.push = null;
    const businessContext = new _models.Business(business);
    this.business = businessContext;
    this.page = new _models.Page();
    _core.Configuration.assign({
      push: {},
      ...config
    });
    _models.Session.initialize(this.page);
    this.initializeVisitSignals(business);
    this.forms?.mutationObserver?.disconnect();
    this.forms = new _models.FormCollection();
    this.query = new _models.Query();
    const businessData = await businessContext.hydrate();
    if (this.business !== businessContext) return;
    let stagedPush = null;
    let stagedAlertData = null;
    if (config.push !== false && businessData?.push?.public_key && _models.Push.supported) {
      stagedPush = new _models.Push(businessData.push);
      if (businessData.alert?.html) stagedAlertData = businessData.alert;
    }
    const popupConfig = config.popup === false ? false : this.deepMergePlainObjects(businessData && businessData.popup || {}, config.popup || {});
    const webchatConfig = config.webchat === false ? false : this.mergeWebchatConfig(businessData && businessData.webchat || {}, config.webchat || {});
    const whatsappConfig = config.whatsappWidget === false ? false : this.mergeWhatsAppConfig(businessData && businessData.whatsapp || {}, config.whatsappWidget || {});
    const hasExplicitBehaviourOverride = config.webchat && config.webchat !== false && Object.prototype.hasOwnProperty.call(config.webchat, 'behaviour');
    _core.Configuration.webchat.behaviourOverride = hasExplicitBehaviourOverride;
    const widgetLoads = [];
    if (webchatConfig && webchatConfig.id) {
      _core.Configuration.webchat.assign(webchatConfig);
      widgetLoads.push(_models.Webchat.load(webchatConfig.id).then(webchat => {
        if (this.business === businessContext) this.webchat = webchat;
      }));
    }
    if (whatsappConfig && whatsappConfig.id) {
      _core.Configuration.whatsapp.assign(whatsappConfig);
      widgetLoads.push(_models.WhatsAppWidget.load(whatsappConfig.id).then(whatsapp => {
        if (this.business === businessContext) this.whatsapp = whatsapp;
      }));
    }
    if (popupConfig && popupConfig.id) {
      const resolvedPopupConfig = {
        container: 'body',
        device: 'auto',
        ...popupConfig
      };
      _core.Configuration.popup.assign(resolvedPopupConfig);
      widgetLoads.push(_models.Popup.load(resolvedPopupConfig.id, {
        container: resolvedPopupConfig.container,
        shouldMount: () => {
          return this.business === businessContext && this.initializationVersion === initializationVersion;
        }
      }).then(popup => {
        if (this.business === businessContext && this.initializationVersion === initializationVersion) {
          this.popup = popup;
        }
      }));
    }
    await Promise.all(widgetLoads);
    if (this.business !== businessContext || this.initializationVersion !== initializationVersion) return;
    this.push = stagedPush;
    this.alert = stagedAlertData ? new _models.Alert(stagedAlertData, businessContext, stagedPush) : null;
    this.push?.initialize().catch(error => {
      console.warn('Hellotext Push initialization failed:', error);
    });
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
      throw new _errors.NotInitializedError();
    }
    const business = this.business;
    const session = this.session;
    const visitBusinessId = this.visitBusinessId;
    const headers = {
      ...(params && params.headers || {}),
      ...this.headers
    };
    const user_parameters = {
      ..._models.User.identificationData,
      ...(params.user_parameters || {})
    };
    const pageInstance = params && params.url ? new _models.Page(params.url) : this.page;
    const body = {
      session,
      user_parameters,
      action,
      ...params,
      ...pageInstance.trackingData
    };
    delete body.headers;
    const response = await _api.default.events.create({
      headers,
      body,
      // Track is the SDK's unload-sensitive analytics path. Keepalive belongs
      // here rather than on identify/forms/webchat calls because event tracking
      // is allowed to be fire-and-navigate, while those other calls have
      // stronger request/response or interaction contracts.
      keepalive: (0, _api.keepaliveFor)(body)
    });
    const trackedAt = this.trackedAtMilliseconds(params.tracked_at);
    if (response.succeeded && this.business === business && this.session === session && this.visitBusinessId === visitBusinessId && (trackedAt === null || trackedAt >= this.visitStartedAt)) this.recordActivity(action);
    return response;
  }
  static recordActivity(action) {
    const field = ACTIVITY_RULE_FIELDS[action];
    if (!field) return;
    this.activities.add(field);
    this.writeStorage('sessionStorage', this.visitStorageKey('activities'), JSON.stringify([...this.activities]));
    this.eventEmitter.dispatch('activity:occurred', {
      action,
      field
    });
  }
  static trackedAtMilliseconds(value) {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return Number.NaN;

      // Public tracking timestamps use Unix seconds. Accept millisecond values as well so
      // integrations that already pass Date#getTime() do not get silently rejected.
      return value < 1_000_000_000_000 ? value * 1000 : value;
    }
    return new Date(value).getTime();
  }
  static initializeVisitSignals(businessId) {
    const businessChanged = this.visitBusinessId !== businessId;
    this.visitBusinessId = businessId;
    if (businessChanged) {
      this.pageViews = 0;
      this.lastPageUrl = undefined;
      this.lastPageRoute = undefined;
      this.activities = new Set(this.readStoredActivities());
      this.visitCampaign = this.readStoredVisitCampaign();
      const storedVisitorType = this.readStorage('sessionStorage', this.visitStorageKey('visitor-type'));
      this.visitorType = ['new', 'returning'].includes(storedVisitorType) ? storedVisitorType : undefined;
      if (!this.visitorType) {
        this.visitorType = this.readStorage('localStorage', this.visitStorageKey('seen')) ? 'returning' : 'new';
        this.writeStorage('sessionStorage', this.visitStorageKey('visitor-type'), this.visitorType);
        this.writeStorage('localStorage', this.visitStorageKey('seen'), '1');
      }
      const storedVisitStartedAt = Number(this.readStorage('sessionStorage', this.visitStorageKey('started-at')));
      this.visitStartedAt = Number.isFinite(storedVisitStartedAt) && storedVisitStartedAt > 0 ? storedVisitStartedAt : this.initialPageStartedAt();
      this.writeStorage('sessionStorage', this.visitStorageKey('started-at'), String(this.visitStartedAt));
    }
    this.rememberVisitCampaign(_models.UTM.paramsFrom(window.location.search));
    if (businessChanged || this.lastPageRoute !== this.pageRoute()) this.recordPageView();
  }

  /**
   * Remembers the campaign this visit arrived with, for as long as the tab lives — the same
   * span as the other visit signals.
   *
   * Display rules read it when the URL no longer carries the parameters, which is the common
   * case: the visitor moves past the landing page, or the site strips them from the URL once
   * its analytics have read them. Persisted attribution answers a different question and is
   * left alone: `hello_utm` still records only a complete source and medium pair, and still
   * outlives the visit.
   */
  static rememberVisitCampaign(params) {
    const campaign = Object.fromEntries(CAMPAIGN_RULE_KEYS.flatMap(key => {
      const value = typeof params?.[key] === 'string' ? params[key].trim() : '';
      return value === '' ? [] : [[key, value]];
    }));
    if (Object.keys(campaign).length === 0) return;
    this.visitCampaign = campaign;
    this.writeStorage('sessionStorage', this.visitStorageKey('campaign'), JSON.stringify(campaign));
  }
  static readStoredVisitCampaign() {
    try {
      const stored = JSON.parse(this.readStorage('sessionStorage', this.visitStorageKey('campaign')) || '{}');
      if (stored === null || typeof stored !== 'object' || Array.isArray(stored)) return {};
      return Object.fromEntries(Object.entries(stored).filter(([key, value]) => CAMPAIGN_RULE_KEYS.includes(key) && typeof value === 'string'));
    } catch (_) {
      return {};
    }
  }
  static recordPageView() {
    const key = this.visitStorageKey('page-views');
    const stored = Number(this.readStorage('sessionStorage', key));
    const firstPageInDocument = !this.lastPageUrl;
    this.pageViews = Number.isInteger(stored) && stored > 0 ? stored + 1 : this.pageViews + 1;
    this.lastPageUrl = window.location.href;
    this.lastPageRoute = this.pageRoute();
    this.pageStartedAt = firstPageInDocument ? this.initialPageStartedAt() : Date.now();
    this.writeStorage('sessionStorage', key, String(this.pageViews));
  }
  static initialPageStartedAt() {
    const navigationUrl = window.performance?.getEntriesByType?.('navigation')?.[0]?.name;
    if (navigationUrl) {
      if (this.pageRoute(navigationUrl) !== this.pageRoute()) return Date.now();
    }
    return window.performance?.timeOrigin || Date.now();
  }
  static pageRoute(value = window.location.href) {
    const currentUrl = window.location?.href || document.location?.href || 'http://localhost/';
    const url = new URL(value || currentUrl, currentUrl);
    const hashRoute = url.hash.match(/^#!?\/[^?]*/)?.[0];
    return `${url.pathname}${hashRoute?.replace(/^#!/, '#') || ''}`;
  }
  static readStoredActivities() {
    try {
      const stored = JSON.parse(this.readStorage('sessionStorage', this.visitStorageKey('activities')) || '[]');
      return Array.isArray(stored) ? stored.filter(field => Object.values(ACTIVITY_RULE_FIELDS).includes(field)) : [];
    } catch (_) {
      return [];
    }
  }
  static visitStorageKey(name) {
    return `hellotext:business:${this.visitBusinessId}:${name}`;
  }
  static storage(name) {
    try {
      return window[name];
    } catch (_) {
      return null;
    }
  }
  static readStorage(name, key) {
    try {
      return this.storage(name)?.getItem(key);
    } catch (_) {
      return null;
    }
  }
  static writeStorage(name, key, value) {
    try {
      this.storage(name)?.setItem(key, value);
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
    const fingerprint = await _models.Fingerprint.generate(this.session, externalId, options);
    if (_models.Fingerprint.matches(_models.User.fingerprint, fingerprint)) {
      return new _api.Response(true, {
        json: async () => ({
          already_identified: true
        })
      });
    }
    const response = await _api.default.identifications.create({
      user_id: externalId,
      ...options
    });
    if (response.succeeded) {
      _models.User.remember(externalId, options.source, fingerprint);
    }
    return response;
  }

  /**
   * Clears the user session, use when the user logs out to clear the hello cookies
   *
   * @returns {void}
   */
  static forget() {
    _models.User.forget();
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
    return _models.Session.session;
  }

  /**
   * Determines if the session is set or not
   * @returns {boolean}
   */
  static get isInitialized() {
    return _models.Session.session !== undefined;
  }

  // private

  static get notInitialized() {
    return !this.business || this.business.id === undefined;
  }
  static get headers() {
    if (this.notInitialized) {
      throw new _errors.NotInitializedError();
    }
    return {
      Authorization: `Bearer ${this.business.id}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
  }
}
var _default = Hellotext;
exports.default = _default;