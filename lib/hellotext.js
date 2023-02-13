"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _event = _interopRequireDefault(require("./event"));
var _eventEmitter2 = _interopRequireDefault(require("./eventEmitter"));
var _response = _interopRequireDefault(require("./response"));
var _query2 = _interopRequireDefault(require("./query"));
var _notInitializedError = require("./errors/notInitializedError");
var _invalidEvent = require("./errors/invalidEvent");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
var apiUrl = 'https://api.hellotext.com/v1/';
var _session = /*#__PURE__*/_classPrivateFieldLooseKey("session");
var _business = /*#__PURE__*/_classPrivateFieldLooseKey("business");
var _eventEmitter = /*#__PURE__*/_classPrivateFieldLooseKey("eventEmitter");
var _query = /*#__PURE__*/_classPrivateFieldLooseKey("query");
var _notInitialized = /*#__PURE__*/_classPrivateFieldLooseKey("notInitialized");
var _mintAnonymousSession = /*#__PURE__*/_classPrivateFieldLooseKey("mintAnonymousSession");
var _headers = /*#__PURE__*/_classPrivateFieldLooseKey("headers");
var _setSessionCookie = /*#__PURE__*/_classPrivateFieldLooseKey("setSessionCookie");
var _cookie = /*#__PURE__*/_classPrivateFieldLooseKey("cookie");
class Hellotext {
  /**
   * initialize the module.
   * @param business public business id
   */
  static initialize(business) {
    _classPrivateFieldLooseBase(this, _business)[_business] = business;
    _classPrivateFieldLooseBase(this, _query)[_query] = new _query2.default(window.location.search);
    if (_classPrivateFieldLooseBase(this, _query)[_query].has("preview")) return;
    var session = _classPrivateFieldLooseBase(this, _query)[_query].get("session") || _classPrivateFieldLooseBase(this, _cookie)[_cookie];
    if (session && session !== "undefined" && session !== "null") {
      _classPrivateFieldLooseBase(this, _session)[_session] = session;
      _classPrivateFieldLooseBase(this, _setSessionCookie)[_setSessionCookie]();
    } else {
      _classPrivateFieldLooseBase(this, _mintAnonymousSession)[_mintAnonymousSession]().then(response => {
        _classPrivateFieldLooseBase(this, _session)[_session] = response.id;
        _classPrivateFieldLooseBase(this, _setSessionCookie)[_setSessionCookie]();
      });
    }
  }

  /**
   * Tracks an action that has happened on the page
   *
   * @param { String } action a valid action name
   * @param { Object } params
   * @returns {Promise<Response>}
   */
  static track(action) {
    var _arguments = arguments,
      _this = this;
    return _asyncToGenerator(function* () {
      var params = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : {};
      if (_classPrivateFieldLooseBase(_this, _notInitialized)[_notInitialized]) {
        throw new _notInitializedError.NotInitializedError();
      }
      if (_classPrivateFieldLooseBase(_this, _query)[_query].has("preview")) {
        return new _response.default(true, {
          received: true
        });
      }
      var response = yield fetch(apiUrl + 'track/events', {
        headers: _classPrivateFieldLooseBase(_this, _headers)[_headers],
        method: 'post',
        body: JSON.stringify(_objectSpread(_objectSpread({
          session: _this.session,
          action
        }, params), {}, {
          url: params && params.url || window.location.href
        }))
      });
      return new _response.default(response.status === 200, yield response.json());
    })();
  }

  /**
   * Registers an event listener
   * @param event the name of the event to listen to
   * @param callback the callback. This method will be called with the payload
   */
  static on(event, callback) {
    if (_event.default.invalid(event)) {
      throw new _invalidEvent.InvalidEvent(event);
    }
    _classPrivateFieldLooseBase(this, _eventEmitter)[_eventEmitter].addSubscriber(event, callback);
  }

  /**
   * Removes an event listener
   * @param event the name of the event to remove
   * @param callback the callback to remove
   */
  static removeEventListener(event, callback) {
    if (_event.default.invalid(event)) {
      throw new _invalidEvent.InvalidEvent(event);
    }
    _classPrivateFieldLooseBase(this, _eventEmitter)[_eventEmitter].removeSubscriber(event, callback);
  }

  /**
   *
   * @returns {String}
   */
  static get session() {
    if (_classPrivateFieldLooseBase(this, _notInitialized)[_notInitialized]) {
      throw new _notInitializedError.NotInitializedError();
    }
    return _classPrivateFieldLooseBase(this, _session)[_session];
  }

  /**
   * Determines if the session is set or not
   * @returns {boolean}
   */
  static get isInitialized() {
    return _classPrivateFieldLooseBase(this, _session)[_session] !== undefined;
  }

  // private
}
function _get_notInitialized() {
  return _classPrivateFieldLooseBase(this, _business)[_business] === undefined;
}
function _mintAnonymousSession2() {
  return _mintAnonymousSession3.apply(this, arguments);
}
function _mintAnonymousSession3() {
  _mintAnonymousSession3 = _asyncToGenerator(function* () {
    if (_classPrivateFieldLooseBase(this, _notInitialized)[_notInitialized]) {
      throw new _notInitializedError.NotInitializedError();
    }
    var trackingUrl = apiUrl + 'track/sessions';
    this.mintingPromise = yield fetch(trackingUrl, {
      method: 'post',
      headers: {
        Authorization: "Bearer ".concat(_classPrivateFieldLooseBase(this, _business)[_business])
      }
    });
    return this.mintingPromise.json();
  });
  return _mintAnonymousSession3.apply(this, arguments);
}
function _get_headers() {
  if (_classPrivateFieldLooseBase(this, _notInitialized)[_notInitialized]) {
    throw new _notInitializedError.NotInitializedError();
  }
  return {
    Authorization: "Bearer ".concat(_classPrivateFieldLooseBase(this, _business)[_business]),
    Accept: 'application.json',
    'Content-Type': 'application/json'
  };
}
function _setSessionCookie2() {
  if (_classPrivateFieldLooseBase(this, _notInitialized)[_notInitialized]) {
    throw new _notInitializedError.NotInitializedError();
  }
  if (_classPrivateFieldLooseBase(this, _eventEmitter)[_eventEmitter].listeners) {
    _classPrivateFieldLooseBase(this, _eventEmitter)[_eventEmitter].emit("session-set", _classPrivateFieldLooseBase(this, _session)[_session]);
  }
  document.cookie = "hello_session=".concat(_classPrivateFieldLooseBase(this, _session)[_session]);
}
function _get_cookie() {
  var _document$cookie$matc;
  return (_document$cookie$matc = document.cookie.match('(^|;)\\s*' + 'hello_session' + '\\s*=\\s*([^;]+)')) === null || _document$cookie$matc === void 0 ? void 0 : _document$cookie$matc.pop();
}
Object.defineProperty(Hellotext, _cookie, {
  get: _get_cookie,
  set: void 0
});
Object.defineProperty(Hellotext, _setSessionCookie, {
  value: _setSessionCookie2
});
Object.defineProperty(Hellotext, _headers, {
  get: _get_headers,
  set: void 0
});
Object.defineProperty(Hellotext, _mintAnonymousSession, {
  value: _mintAnonymousSession2
});
Object.defineProperty(Hellotext, _notInitialized, {
  get: _get_notInitialized,
  set: void 0
});
Object.defineProperty(Hellotext, _session, {
  writable: true,
  value: void 0
});
Object.defineProperty(Hellotext, _business, {
  writable: true,
  value: void 0
});
Object.defineProperty(Hellotext, _eventEmitter, {
  writable: true,
  value: new _eventEmitter2.default()
});
Object.defineProperty(Hellotext, _query, {
  writable: true,
  value: void 0
});
var _default = Hellotext;
exports.default = _default;