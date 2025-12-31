function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { Configuration, Event } from './core';
import API, { Response } from './api';
import { Business, FormCollection, Page, Query, Session, User, Webchat } from './models';
import { NotInitializedError } from './errors';
var Hellotext = /*#__PURE__*/function () {
  function Hellotext() {
    _classCallCheck(this, Hellotext);
  }
  _createClass(Hellotext, null, [{
    key: "initialize",
    value:
    /**
     * initialize the module.
     * @param business public business id
     * @param { Configuration } config
     */
    function () {
      var _initialize = _asyncToGenerator(function* (business, config) {
        Configuration.assign(config);
        Session.initialize();
        this.page = new Page();
        this.business = new Business(business);
        this.forms = new FormCollection();
        this.query = new Query();
        if (Configuration.webchat.id) {
          this.webchat = yield Webchat.load(Configuration.webchat.id);
        }
        if (typeof MutationObserver !== 'undefined') {
          this.forms.collectExistingFormsOnPage();
        }
      });
      function initialize(_x, _x2) {
        return _initialize.apply(this, arguments);
      }
      return initialize;
    }()
    /**
     * Tracks an action that has happened on the page
     *
     * @param { String } action a valid action name
     * @param { Object } params
     * @returns {Promise<Response>}
     */
  }, {
    key: "track",
    value: function () {
      var _track = _asyncToGenerator(function* (action) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (this.notInitialized) {
          throw new NotInitializedError();
        }
        var headers = _objectSpread(_objectSpread({}, params && params.headers || {}), this.headers);
        var user = _objectSpread(_objectSpread({}, User.identificationData), params.user || {});
        var pageInstance = params && params.url ? new Page(params.url) : this.page;
        var body = _objectSpread(_objectSpread({
          session: this.session,
          user,
          action
        }, params), pageInstance.trackingData);
        delete body.headers;
        return yield API.events.create({
          headers,
          body
        });
      });
      function track(_x3) {
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
     * Identifies a user and attaches the hello_session to the user ID
     * @param { String } externalId - the user ID
     * @param { IdentificationOptions } options - the options for the identification
     * @returns {Promise<Response>}
     */
  }, {
    key: "identify",
    value: function () {
      var _identify = _asyncToGenerator(function* (externalId) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (User.id === externalId) {
          return new Response(true, {
            json: function () {
              var _json = _asyncToGenerator(function* () {
                already_identified: true;
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
          User.remember(externalId, options.source);
        }
        return response;
      });
      function identify(_x4) {
        return _identify.apply(this, arguments);
      }
      return identify;
    }()
    /**
     * Clears the user session, use when the user logs out to clear the hello cookies
     *
     * @returns {void}
     */
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
      return this.business.id === undefined;
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
  return Hellotext;
}();
Hellotext.eventEmitter = new Event();
Hellotext.forms = void 0;
Hellotext.business = void 0;
Hellotext.webchat = void 0;
export default Hellotext;