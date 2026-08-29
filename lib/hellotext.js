function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Configuration, Event } from './core';
import API, { Response, keepaliveFor } from './api';
import { Business, Fingerprint, FormCollection, Page, Popup, Query, Session, User, Webchat, WhatsAppWidget } from './models';
import { NotInitializedError } from './errors';
var Hellotext = /*#__PURE__*/function () {
  function Hellotext() {
    _classCallCheck(this, Hellotext);
  }
  return _createClass(Hellotext, null, [{
    key: "initialize",
    value: (
    /**
     * initialize the module.
     * @param business public business id
     * @param { Configuration } config
     */
    function () {
      var _initialize = _asyncToGenerator(function* (business) {
        var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var generation = ++this.initializationGeneration;
        this.initializationBaseline || (this.initializationBaseline = {
          configuration: this.configurationSnapshot(),
          runtime: this.runtimeSnapshot()
        });
        var _this$initializationB = this.initializationBaseline,
          configuration = _this$initializationB.configuration,
          previous = _this$initializationB.runtime;
        var staged = {
          popups: []
        };
        var nextBusiness = new Business(business);
        try {
          var _previous$business, _previous$business$re, _staged$webchat, _staged$webchat$markC, _staged$whatsapp, _staged$whatsapp$mark;
          var businessData = yield nextBusiness.hydrate({
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
          Configuration.assign(config);
          this.business = nextBusiness;
          nextBusiness.loadStylesheet();
          this.page = new Page();
          Session.initialize(this.page);
          this.forms = new FormCollection();
          this.query = new Query();
          this.popup = undefined;
          this.popups = [];
          this.webchat = undefined;
          this.whatsapp = undefined;
          var popupConfigs = config.popup === false ? [] : this.popupConfigs(businessData, config.popup || {});
          var webchatConfig = config.webchat === false ? false : this.mergeWebchatConfig(businessData && businessData.webchat || {}, config.webchat || {});
          var whatsappConfig = config.whatsappWidget === false ? false : this.mergeWhatsAppConfig(businessData && businessData.whatsapp || {}, config.whatsappWidget || {});
          var hasExplicitBehaviourOverride = config.webchat && config.webchat !== false && Object.prototype.hasOwnProperty.call(config.webchat, 'behaviour');
          Configuration.webchat.behaviourOverride = hasExplicitBehaviourOverride;
          if (webchatConfig && webchatConfig.id) {
            Configuration.webchat.assign(webchatConfig);
            staged.webchat = yield Webchat.load(webchatConfig.id);
            if (!this.initializationIsCurrent(generation)) return;
          }
          if (whatsappConfig && whatsappConfig.id) {
            Configuration.whatsapp.assign(whatsappConfig);
            staged.whatsapp = yield WhatsAppWidget.load(whatsappConfig.id);
            if (!this.initializationIsCurrent(generation)) return;
          }
          if (popupConfigs.length > 0) {
            Configuration.popup.assign(popupConfigs[0]);
            for (var popupConfig of popupConfigs) {
              var popup = yield Popup.load(popupConfig.id);
              staged.popups.push(popup);
              if (!this.initializationIsCurrent(generation)) return;
            }
          }
          this.unmountSurfaces(previous);
          (_previous$business = previous.business) === null || _previous$business === void 0 || (_previous$business$re = _previous$business.releaseStylesheet) === null || _previous$business$re === void 0 || _previous$business$re.call(_previous$business);
          (_staged$webchat = staged.webchat) === null || _staged$webchat === void 0 || (_staged$webchat$markC = _staged$webchat.markCoexistingWidgets) === null || _staged$webchat$markC === void 0 || _staged$webchat$markC.call(_staged$webchat);
          (_staged$whatsapp = staged.whatsapp) === null || _staged$whatsapp === void 0 || (_staged$whatsapp$mark = _staged$whatsapp.markCoexistingWidgets) === null || _staged$whatsapp$mark === void 0 || _staged$whatsapp$mark.call(_staged$whatsapp);
          this.webchat = staged.webchat;
          this.whatsapp = staged.whatsapp;
          this.popups = staged.popups;
          this.popup = staged.popups[0];
          if (typeof MutationObserver !== 'undefined') {
            this.forms.collectExistingFormsOnPage();
          }
        } catch (error) {
          this.unmountSurfaces(staged);
          nextBusiness.releaseStylesheet();
          if (this.initializationIsCurrent(generation)) {
            this.restoreRuntime(previous);
            this.restoreConfiguration(configuration);
          }
          throw error;
        } finally {
          if (!this.initializationIsCurrent(generation)) {
            this.unmountSurfaces(staged);
            nextBusiness.releaseStylesheet();
          } else {
            this.initializationBaseline = undefined;
          }
        }
      });
      function initialize(_x) {
        return _initialize.apply(this, arguments);
      }
      return initialize;
    }())
  }, {
    key: "initializationIsCurrent",
    value: function initializationIsCurrent(generation) {
      return this.initializationGeneration === generation;
    }
  }, {
    key: "unmountPopups",
    value: function unmountPopups() {
      this.unmountSurfaces({
        popups: this.popups
      });
    }
  }, {
    key: "unmountSurfaces",
    value: function unmountSurfaces(_ref) {
      var _ref$popups = _ref.popups,
        popups = _ref$popups === void 0 ? [] : _ref$popups,
        webchat = _ref.webchat,
        whatsapp = _ref.whatsapp;
      new Set([...popups, webchat, whatsapp]).forEach(surface => {
        var _surface$unmount;
        return surface === null || surface === void 0 || (_surface$unmount = surface.unmount) === null || _surface$unmount === void 0 ? void 0 : _surface$unmount.call(surface);
      });
    }
  }, {
    key: "runtimeSnapshot",
    value: function runtimeSnapshot() {
      return {
        business: this.business,
        page: this.page,
        forms: this.forms,
        query: this.query,
        popup: this.popup,
        popups: this.popups,
        webchat: this.webchat,
        whatsapp: this.whatsapp
      };
    }
  }, {
    key: "hasExplicitSurface",
    value: function hasExplicitSurface(config) {
      return [config.popup, config.webchat, config.whatsappWidget].some(surface => surface && surface !== false && surface.id);
    }
  }, {
    key: "hasDisabledSurface",
    value: function hasDisabledSurface(config) {
      return config.popup === false || config.webchat === false || config.whatsappWidget === false;
    }
  }, {
    key: "runtimeWithoutDisabledSurfaces",
    value: function runtimeWithoutDisabledSurfaces(previous, config) {
      var disabled = {
        popups: config.popup === false ? previous.popups : [],
        webchat: config.webchat === false ? previous.webchat : undefined,
        whatsapp: config.whatsappWidget === false ? previous.whatsapp : undefined
      };
      this.unmountSurfaces(disabled);
      return _objectSpread(_objectSpread({}, previous), {}, {
        popup: config.popup === false ? undefined : previous.popup,
        popups: config.popup === false ? [] : previous.popups,
        webchat: config.webchat === false ? undefined : previous.webchat,
        whatsapp: config.whatsappWidget === false ? undefined : previous.whatsapp
      });
    }
  }, {
    key: "hasMountedSurfaces",
    value: function hasMountedSurfaces(_ref2) {
      var _ref2$popups = _ref2.popups,
        popups = _ref2$popups === void 0 ? [] : _ref2$popups,
        webchat = _ref2.webchat,
        whatsapp = _ref2.whatsapp;
      return popups.length > 0 || !!webchat || !!whatsapp;
    }
  }, {
    key: "restoreRuntime",
    value: function restoreRuntime(snapshot) {
      Object.assign(this, snapshot);
    }
  }, {
    key: "configurationSnapshot",
    value: function configurationSnapshot() {
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
  }, {
    key: "restoreConfiguration",
    value: function restoreConfiguration(snapshot) {
      Configuration.apiRoot = snapshot.apiRoot;
      Configuration.actionCableUrl = snapshot.actionCableUrl;
      Configuration.autoGenerateSession = snapshot.autoGenerateSession;
      Configuration.session = snapshot.session;
      Configuration.locale = snapshot.locale;
      Configuration.forms.assign(snapshot.forms);
      Configuration.popup.assign(snapshot.popup);
      Configuration.webchat.assign(snapshot.webchat);
      Configuration.webchat.behaviourOverride = snapshot.webchat.behaviourOverride;
      Configuration.whatsapp.assign(snapshot.whatsapp);
    }
  }, {
    key: "clone",
    value: function clone(value) {
      if (Array.isArray(value)) return value.map(item => this.clone(item));
      if (!this.isPlainObject(value)) return value;
      return Object.fromEntries(Object.entries(value).map(_ref3 => {
        var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          item = _ref4[1];
        return [key, this.clone(item)];
      }));
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
    key: "popupConfigs",
    value: function popupConfigs(businessData, localConfig) {
      if (localConfig.id) {
        return [localConfig];
      }
      var configuredPopups = Array.isArray(businessData && businessData.popups) ? businessData.popups.filter(config => config && config.id) : [];
      var dashboardConfigs = configuredPopups.length > 0 ? configuredPopups : [businessData && businessData.popup || {}];
      return dashboardConfigs.filter(config => config && config.id).map(config => this.mergePopupConfig(config, localConfig)).filter((config, index, configs) => configs.findIndex(candidate => candidate.id === config.id) === index);
    }
  }, {
    key: "deepMergePlainObjects",
    value: function deepMergePlainObjects(base, override) {
      var result = _objectSpread({}, base);
      Object.entries(override).forEach(_ref5 => {
        var _ref6 = _slicedToArray(_ref5, 2),
          key = _ref6[0],
          value = _ref6[1];
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
    value: (function () {
      var _track = _asyncToGenerator(function* (action) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (this.notInitialized) {
          throw new NotInitializedError();
        }
        var headers = _objectSpread(_objectSpread({}, params && params.headers || {}), this.headers);
        var user_parameters = _objectSpread(_objectSpread({}, User.identificationData), params.user_parameters || {});
        var pageInstance = params && params.url ? new Page(params.url) : this.page;
        var body = _objectSpread(_objectSpread({
          session: this.session,
          user_parameters,
          action
        }, params), pageInstance.trackingData);
        delete body.headers;
        return yield API.events.create({
          headers,
          body,
          // Track is the SDK's unload-sensitive analytics path. Keepalive belongs
          // here rather than on identify/forms/webchat calls because event tracking
          // is allowed to be fire-and-navigate, while those other calls have
          // stronger request/response or interaction contracts.
          keepalive: keepaliveFor(body)
        });
      });
      function track(_x2) {
        return _track.apply(this, arguments);
      }
      return track;
    }()
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
    )
  }, {
    key: "identify",
    value: (function () {
      var _identify = _asyncToGenerator(function* (externalId) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var fingerprint = yield Fingerprint.generate(this.session, externalId, options);
        if (Fingerprint.matches(User.fingerprint, fingerprint)) {
          return new Response(true, {
            json: function () {
              var _json = _asyncToGenerator(function* () {
                return {
                  already_identified: true
                };
              });
              function json() {
                return _json.apply(this, arguments);
              }
              return json;
            }()
          });
        }
        var response = yield API.identifications.create(_objectSpread({
          user_id: externalId
        }, options));
        if (response.succeeded) {
          User.remember(externalId, options.source, fingerprint);
        }
        return response;
      });
      function identify(_x3) {
        return _identify.apply(this, arguments);
      }
      return identify;
    }()
    /**
     * Clears the user session, use when the user logs out to clear the hello cookies
     *
     * @returns {void}
     */
    )
  }, {
    key: "forget",
    value: function forget() {
      User.forget();
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
    get: function get() {
      return Session.session;
    }

    /**
     * Determines if the session is set or not
     * @returns {boolean}
     */
  }, {
    key: "isInitialized",
    get: function get() {
      return Session.session !== undefined;
    }

    // private
  }, {
    key: "notInitialized",
    get: function get() {
      return !this.business || this.business.id === undefined;
    }
  }, {
    key: "headers",
    get: function get() {
      if (this.notInitialized) {
        throw new NotInitializedError();
      }
      return {
        Authorization: "Bearer ".concat(this.business.id),
        Accept: 'application/json',
        'Content-Type': 'application/json'
      };
    }
  }]);
}();
Hellotext.eventEmitter = new Event();
Hellotext.forms = void 0;
Hellotext.business = void 0;
Hellotext.popup = void 0;
Hellotext.popups = [];
Hellotext.webchat = void 0;
Hellotext.whatsapp = void 0;
Hellotext.initializationGeneration = 0;
Hellotext.initializationBaseline = void 0;
export default Hellotext;