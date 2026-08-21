"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("./core");
var _api = _interopRequireWildcard(require("./api"));
var _models = require("./models");
var _errors = require("./errors");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let Hellotext = /*#__PURE__*/function () {
  function Hellotext() {
    _classCallCheck(this, Hellotext);
  }
  return _createClass(Hellotext, null, [{
    key: "initialize",
    value:
    /**
     * initialize the module.
     * @param business public business id
     * @param { Configuration } config
     */
    async function initialize(business, config = {}) {
      this.business = new _models.Business(business);
      this.page = new _models.Page();
      _core.Configuration.assign(config);
      _models.Session.initialize(this.page);
      this.forms = new _models.FormCollection();
      this.query = new _models.Query();
      const businessData = await this.business.hydrate();
      const popupConfig = config.popup === false ? false : this.mergePopupConfig(businessData && businessData.popup || {}, config.popup || {});
      const webchatConfig = config.webchat === false ? false : this.mergeWebchatConfig(businessData && businessData.webchat || {}, config.webchat || {});
      const whatsappConfig = config.whatsappWidget === false ? false : this.mergeWhatsAppConfig(businessData && businessData.whatsapp || {}, config.whatsappWidget || {});
      const hasExplicitBehaviourOverride = config.webchat && config.webchat !== false && Object.prototype.hasOwnProperty.call(config.webchat, 'behaviour');
      _core.Configuration.webchat.behaviourOverride = hasExplicitBehaviourOverride;
      if (webchatConfig && webchatConfig.id) {
        _core.Configuration.webchat.assign(webchatConfig);
        this.webchat = await _models.Webchat.load(webchatConfig.id);
      }
      if (whatsappConfig && whatsappConfig.id) {
        _core.Configuration.whatsapp.assign(whatsappConfig);
        this.whatsapp = await _models.WhatsAppWidget.load(whatsappConfig.id);
      }
      if (popupConfig && popupConfig.id) {
        _core.Configuration.popup.assign(popupConfig);
        this.popup = await _models.Popup.load(popupConfig.id);
      }
      if (typeof MutationObserver !== 'undefined') {
        this.forms.collectExistingFormsOnPage();
      }
    }
  }, {
    key: "mergeWebchatConfig",
    value: function mergeWebchatConfig(dashboardConfig, localConfig) {
      return this.deepMergePlainObjects(dashboardConfig, localConfig);
    }
  }, {
    key: "mergeWhatsAppConfig",
    value: function mergeWhatsAppConfig(dashboardConfig, localConfig) {
      return this.deepMergePlainObjects(dashboardConfig, localConfig);
    }
  }, {
    key: "mergePopupConfig",
    value: function mergePopupConfig(dashboardConfig, localConfig) {
      return this.deepMergePlainObjects(dashboardConfig, localConfig);
    }
  }, {
    key: "deepMergePlainObjects",
    value: function deepMergePlainObjects(base, override) {
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
  }, {
    key: "isPlainObject",
    value: function isPlainObject(value) {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    /**
     * Tracks an action that has happened on the page
     *
     * @param { String } action a valid action name
     * @param { Object } params
     * @returns {Promise<Response>}
     */
  }, {
    key: "track",
    value: async function track(action, params = {}) {
      if (this.notInitialized) {
        throw new _errors.NotInitializedError();
      }
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
        session: this.session,
        user_parameters,
        action,
        ...params,
        ...pageInstance.trackingData
      };
      delete body.headers;
      return await _api.default.events.create({
        headers,
        body,
        // Track is the SDK's unload-sensitive analytics path. Keepalive belongs
        // here rather than on identify/forms/webchat calls because event tracking
        // is allowed to be fire-and-navigate, while those other calls have
        // stronger request/response or interaction contracts.
        keepalive: (0, _api.keepaliveFor)(body)
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
  }, {
    key: "identify",
    value: async function identify(externalId, options = {}) {
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
  }, {
    key: "forget",
    value: function forget() {
      _models.User.forget();
    }

    /**
     * Registers an event listener
     * @param event the name of the event to listen to
     * @param callback the callback. This method will be called with the payload
     */
  }, {
    key: "on",
    value: function on(event, callback) {
      this.eventEmitter.addSubscriber(event, callback);
    }

    /**
     * Removes an event listener
     * @param event the name of the event to remove
     * @param callback the callback to remove
     */
  }, {
    key: "removeEventListener",
    value: function removeEventListener(event, callback) {
      this.eventEmitter.removeSubscriber(event, callback);
    }

    /**
     *
     * @returns {String}
     */
  }, {
    key: "session",
    get: function () {
      return _models.Session.session;
    }

    /**
     * Determines if the session is set or not
     * @returns {boolean}
     */
  }, {
    key: "isInitialized",
    get: function () {
      return _models.Session.session !== undefined;
    }

    // private
  }, {
    key: "notInitialized",
    get: function () {
      return !this.business || this.business.id === undefined;
    }
  }, {
    key: "headers",
    get: function () {
      if (this.notInitialized) {
        throw new _errors.NotInitializedError();
      }
      return {
        Authorization: `Bearer ${this.business.id}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      };
    }
  }]);
}();
Hellotext.eventEmitter = new _core.Event();
Hellotext.forms = void 0;
Hellotext.business = void 0;
Hellotext.popup = void 0;
Hellotext.webchat = void 0;
Hellotext.whatsapp = void 0;
var _default = exports.default = Hellotext;