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
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
var _session = /*#__PURE__*/_classPrivateFieldLooseKey("session");
var _query = /*#__PURE__*/_classPrivateFieldLooseKey("query");
let Hellotext = /*#__PURE__*/function () {
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
    async function initialize(business, config) {
      this.business = new _models.Business(business);
      _core.Configuration.assign(config);
      _models.Session.initialize();
      _classPrivateFieldLooseBase(this, _query)[_query] = new _models.Query();
      this.forms = new _models.FormCollection();
      if (_core.Configuration.webchat.id) {
        this.webchat = await _models.Webchat.load(_core.Configuration.webchat.id);
      }
      this.forms.collect();
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
      const body = {
        session: this.session,
        action,
        ...params,
        url: params && params.url || window.location.href
      };
      delete body.headers;
      return await _api.default.events.create({
        headers,
        body
      });
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
      return this.business.id === undefined;
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
  return Hellotext;
}();
Object.defineProperty(Hellotext, _session, {
  writable: true,
  value: void 0
});
Object.defineProperty(Hellotext, _query, {
  writable: true,
  value: void 0
});
Hellotext.eventEmitter = new _core.Event();
Hellotext.forms = void 0;
Hellotext.business = void 0;
Hellotext.webchat = void 0;
var _default = Hellotext;
exports.default = _default;