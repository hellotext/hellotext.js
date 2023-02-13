"use strict";

require("core-js/modules/es.symbol.to-primitive.js");
require("core-js/modules/es.date.to-primitive.js");
require("core-js/modules/es.symbol.js");
require("core-js/modules/es.symbol.description.js");
require("core-js/modules/es.number.constructor.js");
require("core-js/modules/es.object.keys.js");
require("core-js/modules/es.array.filter.js");
require("core-js/modules/es.object.get-own-property-descriptor.js");
require("core-js/modules/es.array.for-each.js");
require("core-js/modules/web.dom-collections.for-each.js");
require("core-js/modules/es.object.get-own-property-descriptors.js");
require("core-js/modules/es.object.define-properties.js");
require("core-js/modules/es.symbol.iterator.js");
require("core-js/modules/es.array.iterator.js");
require("core-js/modules/es.string.iterator.js");
require("core-js/modules/web.dom-collections.iterator.js");
require("core-js/modules/es.symbol.async-iterator.js");
require("core-js/modules/es.symbol.to-string-tag.js");
require("core-js/modules/es.json.to-string-tag.js");
require("core-js/modules/es.math.to-string-tag.js");
require("core-js/modules/es.object.create.js");
require("core-js/modules/es.object.get-prototype-of.js");
require("core-js/modules/es.function.name.js");
require("core-js/modules/es.object.set-prototype-of.js");
require("core-js/modules/es.array.reverse.js");
require("core-js/modules/es.array.slice.js");
require("@babel/plugin-proposal-private-methods/lib/index")
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
require("core-js/modules/es.regexp.exec.js");
require("core-js/modules/es.string.search.js");
require("core-js/modules/es.object.to-string.js");
require("core-js/modules/es.promise.js");
require("core-js/modules/es.object.define-property.js");
require("core-js/modules/es.string.match.js");
var _event = _interopRequireDefault(require("./event"));
var _eventEmitter2 = _interopRequireDefault(require("./eventEmitter"));
var _response = _interopRequireDefault(require("./response"));
var _query2 = _interopRequireDefault(require("./query"));
var _notInitializedError = require("./errors/notInitializedError");
var _invalidEvent = require("./errors/invalidEvent");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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
     */
    function initialize(business) {
      var _this = this;
      _classPrivateFieldLooseBase(this, _business)[_business] = business;
      _classPrivateFieldLooseBase(this, _query)[_query] = new _query2["default"](window.location.search);
      if (_classPrivateFieldLooseBase(this, _query)[_query].has("preview")) return;
      var session = _classPrivateFieldLooseBase(this, _query)[_query].get("session") || _classPrivateFieldLooseBase(this, _cookie)[_cookie];
      if (session && session !== "undefined" && session !== "null") {
        _classPrivateFieldLooseBase(this, _session)[_session] = session;
        _classPrivateFieldLooseBase(this, _setSessionCookie)[_setSessionCookie]();
      } else {
        _classPrivateFieldLooseBase(this, _mintAnonymousSession)[_mintAnonymousSession]().then(function (response) {
          _classPrivateFieldLooseBase(_this, _session)[_session] = response.id;
          _classPrivateFieldLooseBase(_this, _setSessionCookie)[_setSessionCookie]();
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
  }, {
    key: "track",
    value: function () {
      var _track = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(action) {
        var params,
          response,
          _args = arguments;
        return _regeneratorRuntime().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              params = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
              if (!_classPrivateFieldLooseBase(this, _notInitialized)[_notInitialized]) {
                _context.next = 3;
                break;
              }
              throw new _notInitializedError.NotInitializedError();
            case 3:
              if (!_classPrivateFieldLooseBase(this, _query)[_query].has("preview")) {
                _context.next = 5;
                break;
              }
              return _context.abrupt("return", new _response["default"](true, {
                received: true
              }));
            case 5:
              _context.next = 7;
              return fetch(apiUrl + 'track/events', {
                headers: _classPrivateFieldLooseBase(this, _headers)[_headers],
                method: 'post',
                body: JSON.stringify(_objectSpread(_objectSpread({
                  session: this.session,
                  action: action
                }, params), {}, {
                  url: params && params.url || window.location.href
                }))
              });
            case 7:
              response = _context.sent;
              _context.t0 = _response["default"];
              _context.t1 = response.status === 200;
              _context.next = 12;
              return response.json();
            case 12:
              _context.t2 = _context.sent;
              return _context.abrupt("return", new _context.t0(_context.t1, _context.t2));
            case 14:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }));
      function track(_x) {
        return _track.apply(this, arguments);
      }
      return track;
    }()
    /**
     * Registers an event listener
     * @param event the name of the event to listen to
     * @param callback the callback. This method will be called with the payload
     */
  }, {
    key: "on",
    value: function on(event, callback) {
      if (_event["default"].invalid(event)) {
        throw new _invalidEvent.InvalidEvent(event);
      }
      _classPrivateFieldLooseBase(this, _eventEmitter)[_eventEmitter].addSubscriber(event, callback);
    }

    /**
     * Removes an event listener
     * @param event the name of the event to remove
     * @param callback the callback to remove
     */
  }, {
    key: "removeEventListener",
    value: function removeEventListener(event, callback) {
      if (_event["default"].invalid(event)) {
        throw new _invalidEvent.InvalidEvent(event);
      }
      _classPrivateFieldLooseBase(this, _eventEmitter)[_eventEmitter].removeSubscriber(event, callback);
    }

    /**
     *
     * @returns {String}
     */
  }, {
    key: "session",
    get: function get() {
      if (_classPrivateFieldLooseBase(this, _notInitialized)[_notInitialized]) {
        throw new _notInitializedError.NotInitializedError();
      }
      return _classPrivateFieldLooseBase(this, _session)[_session];
    }

    /**
     * Determines if the session is set or not
     * @returns {boolean}
     */
  }, {
    key: "isInitialized",
    get: function get() {
      return _classPrivateFieldLooseBase(this, _session)[_session] !== undefined;
    }

    // private
  }]);
  return Hellotext;
}();
function _get_notInitialized() {
  return _classPrivateFieldLooseBase(this, _business)[_business] === undefined;
}
function _mintAnonymousSession2() {
  return _mintAnonymousSession3.apply(this, arguments);
}
function _mintAnonymousSession3() {
  _mintAnonymousSession3 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
    var trackingUrl;
    return _regeneratorRuntime().wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          if (!_classPrivateFieldLooseBase(this, _notInitialized)[_notInitialized]) {
            _context2.next = 2;
            break;
          }
          throw new _notInitializedError.NotInitializedError();
        case 2:
          trackingUrl = apiUrl + 'track/sessions';
          _context2.next = 5;
          return fetch(trackingUrl, {
            method: 'post',
            headers: {
              Authorization: "Bearer ".concat(_classPrivateFieldLooseBase(this, _business)[_business])
            }
          });
        case 5:
          this.mintingPromise = _context2.sent;
          return _context2.abrupt("return", this.mintingPromise.json());
        case 7:
        case "end":
          return _context2.stop();
      }
    }, _callee2, this);
  }));
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
  value: new _eventEmitter2["default"]()
});
Object.defineProperty(Hellotext, _query, {
  writable: true,
  value: void 0
});
var _default = Hellotext;
exports["default"] = _default;
