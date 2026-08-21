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
        this.business = new Business(business);
        this.page = new Page();
        Configuration.assign(config);
        Session.initialize(this.page);
        this.forms = new FormCollection();
        this.query = new Query();
        var businessData = yield this.business.hydrate();
        var popupConfig = config.popup === false ? false : this.mergePopupConfig(businessData && businessData.popup || {}, config.popup || {});
        var webchatConfig = config.webchat === false ? false : this.mergeWebchatConfig(businessData && businessData.webchat || {}, config.webchat || {});
        var whatsappConfig = config.whatsappWidget === false ? false : this.mergeWhatsAppConfig(businessData && businessData.whatsapp || {}, config.whatsappWidget || {});
        var hasExplicitBehaviourOverride = config.webchat && config.webchat !== false && Object.prototype.hasOwnProperty.call(config.webchat, 'behaviour');
        Configuration.webchat.behaviourOverride = hasExplicitBehaviourOverride;
        if (webchatConfig && webchatConfig.id) {
          Configuration.webchat.assign(webchatConfig);
          this.webchat = yield Webchat.load(webchatConfig.id);
        }
        if (whatsappConfig && whatsappConfig.id) {
          Configuration.whatsapp.assign(whatsappConfig);
          this.whatsapp = yield WhatsAppWidget.load(whatsappConfig.id);
        }
        if (popupConfig && popupConfig.id) {
          Configuration.popup.assign(popupConfig);
          this.popup = yield Popup.load(popupConfig.id);
        }
        if (typeof MutationObserver !== 'undefined') {
          this.forms.collectExistingFormsOnPage();
        }
      });
      function initialize(_x) {
        return _initialize.apply(this, arguments);
      }
      return initialize;
    }())
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
      var result = _objectSpread({}, base);
      Object.entries(override).forEach(_ref => {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];
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
Hellotext.webchat = void 0;
Hellotext.whatsapp = void 0;
export default Hellotext;