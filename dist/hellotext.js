/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./lib/errors/invalidEvent.js":
/*!************************************!*\
  !*** ./lib/errors/invalidEvent.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n\nObject.defineProperty(exports, \"__esModule\", ({\n  value: true\n}));\nexports.InvalidEvent = void 0;\nclass InvalidEvent extends Error {\n  constructor(event) {\n    super(\"\".concat(event, \" is not valid. Please provide a valid event name\"));\n    this.name = 'InvalidEvent';\n  }\n}\nexports.InvalidEvent = InvalidEvent;\n\n//# sourceURL=webpack://@hellotext/hellotext/./lib/errors/invalidEvent.js?");

/***/ }),

/***/ "./lib/errors/notInitializedError.js":
/*!*******************************************!*\
  !*** ./lib/errors/notInitializedError.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n\nObject.defineProperty(exports, \"__esModule\", ({\n  value: true\n}));\nexports.NotInitializedError = void 0;\nclass NotInitializedError extends Error {\n  constructor() {\n    super('You need to initialize before tracking events. Call Hellotext.initialize and pass your public business id');\n    this.name = 'NotInitializedError';\n  }\n}\nexports.NotInitializedError = NotInitializedError;\n\n//# sourceURL=webpack://@hellotext/hellotext/./lib/errors/notInitializedError.js?");

/***/ }),

/***/ "./lib/event.js":
/*!**********************!*\
  !*** ./lib/event.js ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n\nObject.defineProperty(exports, \"__esModule\", ({\n  value: true\n}));\nexports[\"default\"] = void 0;\nclass Event {\n  static valid(name) {\n    return Event.exists(name);\n  }\n  static invalid(name) {\n    return !this.valid(name);\n  }\n  static exists(name) {\n    return this.events.find(eventName => eventName === name) !== undefined;\n  }\n}\nexports[\"default\"] = Event;\nEvent.events = [\"session-set\"];\n\n//# sourceURL=webpack://@hellotext/hellotext/./lib/event.js?");

/***/ }),

/***/ "./lib/eventEmitter.js":
/*!*****************************!*\
  !*** ./lib/eventEmitter.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n\nObject.defineProperty(exports, \"__esModule\", ({\n  value: true\n}));\nexports[\"default\"] = void 0;\nfunction ownKeys(object, enumerableOnly) {\n  var keys = Object.keys(object);\n  if (Object.getOwnPropertySymbols) {\n    var symbols = Object.getOwnPropertySymbols(object);\n    enumerableOnly && (symbols = symbols.filter(function (sym) {\n      return Object.getOwnPropertyDescriptor(object, sym).enumerable;\n    })), keys.push.apply(keys, symbols);\n  }\n  return keys;\n}\nfunction _objectSpread(target) {\n  for (var i = 1; i < arguments.length; i++) {\n    var source = null != arguments[i] ? arguments[i] : {};\n    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {\n      _defineProperty(target, key, source[key]);\n    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {\n      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));\n    });\n  }\n  return target;\n}\nfunction _defineProperty(obj, key, value) {\n  key = _toPropertyKey(key);\n  if (key in obj) {\n    Object.defineProperty(obj, key, {\n      value: value,\n      enumerable: true,\n      configurable: true,\n      writable: true\n    });\n  } else {\n    obj[key] = value;\n  }\n  return obj;\n}\nfunction _toPropertyKey(arg) {\n  var key = _toPrimitive(arg, \"string\");\n  return typeof key === \"symbol\" ? key : String(key);\n}\nfunction _toPrimitive(input, hint) {\n  if (typeof input !== \"object\" || input === null) return input;\n  var prim = input[Symbol.toPrimitive];\n  if (prim !== undefined) {\n    var res = prim.call(input, hint || \"default\");\n    if (typeof res !== \"object\") return res;\n    throw new TypeError(\"@@toPrimitive must return a primitive value.\");\n  }\n  return (hint === \"string\" ? String : Number)(input);\n}\nclass EventEmitter {\n  constructor() {\n    this.subscribers = {};\n  }\n  addSubscriber(eventName, callback) {\n    this.subscribers = _objectSpread(_objectSpread({}, this.subscribers), {}, {\n      [eventName]: this.subscribers[eventName] ? [...this.subscribers[eventName], callback] : [callback]\n    });\n  }\n  removeSubscriber(eventName, callback) {\n    if (this.subscribers[eventName]) {\n      this.subscribers[eventName] = this.subscribers[eventName].filter(cb => cb !== callback);\n    }\n  }\n  emit(eventName, data) {\n    this.subscribers[eventName].forEach(subscriber => {\n      subscriber(data);\n    });\n  }\n  get listeners() {\n    return Object.keys(this.subscribers).length !== 0;\n  }\n}\nexports[\"default\"] = EventEmitter;\n\n//# sourceURL=webpack://@hellotext/hellotext/./lib/eventEmitter.js?");

/***/ }),

/***/ "./lib/hellotext.js":
/*!**************************!*\
  !*** ./lib/hellotext.js ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\n\nObject.defineProperty(exports, \"__esModule\", ({\n  value: true\n}));\nexports[\"default\"] = void 0;\nvar _event = _interopRequireDefault(__webpack_require__(/*! ./event */ \"./lib/event.js\"));\nvar _eventEmitter2 = _interopRequireDefault(__webpack_require__(/*! ./eventEmitter */ \"./lib/eventEmitter.js\"));\nvar _response = _interopRequireDefault(__webpack_require__(/*! ./response */ \"./lib/response.js\"));\nvar _query2 = _interopRequireDefault(__webpack_require__(/*! ./query */ \"./lib/query.js\"));\nvar _notInitializedError = __webpack_require__(/*! ./errors/notInitializedError */ \"./lib/errors/notInitializedError.js\");\nvar _invalidEvent = __webpack_require__(/*! ./errors/invalidEvent */ \"./lib/errors/invalidEvent.js\");\nfunction _interopRequireDefault(obj) {\n  return obj && obj.__esModule ? obj : {\n    default: obj\n  };\n}\nfunction ownKeys(object, enumerableOnly) {\n  var keys = Object.keys(object);\n  if (Object.getOwnPropertySymbols) {\n    var symbols = Object.getOwnPropertySymbols(object);\n    enumerableOnly && (symbols = symbols.filter(function (sym) {\n      return Object.getOwnPropertyDescriptor(object, sym).enumerable;\n    })), keys.push.apply(keys, symbols);\n  }\n  return keys;\n}\nfunction _objectSpread(target) {\n  for (var i = 1; i < arguments.length; i++) {\n    var source = null != arguments[i] ? arguments[i] : {};\n    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {\n      _defineProperty(target, key, source[key]);\n    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {\n      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));\n    });\n  }\n  return target;\n}\nfunction _defineProperty(obj, key, value) {\n  key = _toPropertyKey(key);\n  if (key in obj) {\n    Object.defineProperty(obj, key, {\n      value: value,\n      enumerable: true,\n      configurable: true,\n      writable: true\n    });\n  } else {\n    obj[key] = value;\n  }\n  return obj;\n}\nfunction _toPropertyKey(arg) {\n  var key = _toPrimitive(arg, \"string\");\n  return typeof key === \"symbol\" ? key : String(key);\n}\nfunction _toPrimitive(input, hint) {\n  if (typeof input !== \"object\" || input === null) return input;\n  var prim = input[Symbol.toPrimitive];\n  if (prim !== undefined) {\n    var res = prim.call(input, hint || \"default\");\n    if (typeof res !== \"object\") return res;\n    throw new TypeError(\"@@toPrimitive must return a primitive value.\");\n  }\n  return (hint === \"string\" ? String : Number)(input);\n}\nfunction asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {\n  try {\n    var info = gen[key](arg);\n    var value = info.value;\n  } catch (error) {\n    reject(error);\n    return;\n  }\n  if (info.done) {\n    resolve(value);\n  } else {\n    Promise.resolve(value).then(_next, _throw);\n  }\n}\nfunction _asyncToGenerator(fn) {\n  return function () {\n    var self = this,\n      args = arguments;\n    return new Promise(function (resolve, reject) {\n      var gen = fn.apply(self, args);\n      function _next(value) {\n        asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value);\n      }\n      function _throw(err) {\n        asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err);\n      }\n      _next(undefined);\n    });\n  };\n}\nfunction _classPrivateFieldLooseBase(receiver, privateKey) {\n  if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {\n    throw new TypeError(\"attempted to use private field on non-instance\");\n  }\n  return receiver;\n}\nvar id = 0;\nfunction _classPrivateFieldLooseKey(name) {\n  return \"__private_\" + id++ + \"_\" + name;\n}\nvar apiUrl = 'https://api.hellotext.com/v1/';\nvar _session = /*#__PURE__*/_classPrivateFieldLooseKey(\"session\");\nvar _business = /*#__PURE__*/_classPrivateFieldLooseKey(\"business\");\nvar _eventEmitter = /*#__PURE__*/_classPrivateFieldLooseKey(\"eventEmitter\");\nvar _query = /*#__PURE__*/_classPrivateFieldLooseKey(\"query\");\nvar _notInitialized = /*#__PURE__*/_classPrivateFieldLooseKey(\"notInitialized\");\nvar _mintAnonymousSession = /*#__PURE__*/_classPrivateFieldLooseKey(\"mintAnonymousSession\");\nvar _headers = /*#__PURE__*/_classPrivateFieldLooseKey(\"headers\");\nvar _setSessionCookie = /*#__PURE__*/_classPrivateFieldLooseKey(\"setSessionCookie\");\nvar _cookie = /*#__PURE__*/_classPrivateFieldLooseKey(\"cookie\");\nclass Hellotext {\n  /**\n   * initialize the module.\n   * @param business public business id\n   */\n  static initialize(business) {\n    _classPrivateFieldLooseBase(this, _business)[_business] = business;\n    _classPrivateFieldLooseBase(this, _query)[_query] = new _query2.default(window.location.search);\n    if (_classPrivateFieldLooseBase(this, _query)[_query].has(\"preview\")) return;\n    var session = _classPrivateFieldLooseBase(this, _query)[_query].get(\"session\") || _classPrivateFieldLooseBase(this, _cookie)[_cookie];\n    if (session && session !== \"undefined\" && session !== \"null\") {\n      _classPrivateFieldLooseBase(this, _session)[_session] = session;\n      _classPrivateFieldLooseBase(this, _setSessionCookie)[_setSessionCookie]();\n    } else {\n      _classPrivateFieldLooseBase(this, _mintAnonymousSession)[_mintAnonymousSession]().then(response => {\n        _classPrivateFieldLooseBase(this, _session)[_session] = response.id;\n        _classPrivateFieldLooseBase(this, _setSessionCookie)[_setSessionCookie]();\n      });\n    }\n  }\n\n  /**\n   * Tracks an action that has happened on the page\n   *\n   * @param { String } action a valid action name\n   * @param { Object } params\n   * @returns {Promise<Response>}\n   */\n  static track(action) {\n    var _arguments = arguments,\n      _this = this;\n    return _asyncToGenerator(function* () {\n      var params = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : {};\n      if (_classPrivateFieldLooseBase(_this, _notInitialized)[_notInitialized]) {\n        throw new _notInitializedError.NotInitializedError();\n      }\n      if (_classPrivateFieldLooseBase(_this, _query)[_query].has(\"preview\")) {\n        return new _response.default(true, {\n          received: true\n        });\n      }\n      var response = yield fetch(apiUrl + 'track/events', {\n        headers: _classPrivateFieldLooseBase(_this, _headers)[_headers],\n        method: 'post',\n        body: JSON.stringify(_objectSpread(_objectSpread({\n          session: _this.session,\n          action\n        }, params), {}, {\n          url: params && params.url || window.location.href\n        }))\n      });\n      return new _response.default(response.status === 200, yield response.json());\n    })();\n  }\n\n  /**\n   * Registers an event listener\n   * @param event the name of the event to listen to\n   * @param callback the callback. This method will be called with the payload\n   */\n  static on(event, callback) {\n    if (_event.default.invalid(event)) {\n      throw new _invalidEvent.InvalidEvent(event);\n    }\n    _classPrivateFieldLooseBase(this, _eventEmitter)[_eventEmitter].addSubscriber(event, callback);\n  }\n\n  /**\n   * Removes an event listener\n   * @param event the name of the event to remove\n   * @param callback the callback to remove\n   */\n  static removeEventListener(event, callback) {\n    if (_event.default.invalid(event)) {\n      throw new _invalidEvent.InvalidEvent(event);\n    }\n    _classPrivateFieldLooseBase(this, _eventEmitter)[_eventEmitter].removeSubscriber(event, callback);\n  }\n\n  /**\n   *\n   * @returns {String}\n   */\n  static get session() {\n    if (_classPrivateFieldLooseBase(this, _notInitialized)[_notInitialized]) {\n      throw new _notInitializedError.NotInitializedError();\n    }\n    return _classPrivateFieldLooseBase(this, _session)[_session];\n  }\n\n  /**\n   * Determines if the session is set or not\n   * @returns {boolean}\n   */\n  static get isInitialized() {\n    return _classPrivateFieldLooseBase(this, _session)[_session] !== undefined;\n  }\n\n  // private\n}\n\nfunction _get_notInitialized() {\n  return _classPrivateFieldLooseBase(this, _business)[_business] === undefined;\n}\nfunction _mintAnonymousSession2() {\n  return _mintAnonymousSession3.apply(this, arguments);\n}\nfunction _mintAnonymousSession3() {\n  _mintAnonymousSession3 = _asyncToGenerator(function* () {\n    if (_classPrivateFieldLooseBase(this, _notInitialized)[_notInitialized]) {\n      throw new _notInitializedError.NotInitializedError();\n    }\n    var trackingUrl = apiUrl + 'track/sessions';\n    this.mintingPromise = yield fetch(trackingUrl, {\n      method: 'post',\n      headers: {\n        Authorization: \"Bearer \".concat(_classPrivateFieldLooseBase(this, _business)[_business])\n      }\n    });\n    return this.mintingPromise.json();\n  });\n  return _mintAnonymousSession3.apply(this, arguments);\n}\nfunction _get_headers() {\n  if (_classPrivateFieldLooseBase(this, _notInitialized)[_notInitialized]) {\n    throw new _notInitializedError.NotInitializedError();\n  }\n  return {\n    Authorization: \"Bearer \".concat(_classPrivateFieldLooseBase(this, _business)[_business]),\n    Accept: 'application.json',\n    'Content-Type': 'application/json'\n  };\n}\nfunction _setSessionCookie2() {\n  if (_classPrivateFieldLooseBase(this, _notInitialized)[_notInitialized]) {\n    throw new _notInitializedError.NotInitializedError();\n  }\n  if (_classPrivateFieldLooseBase(this, _eventEmitter)[_eventEmitter].listeners) {\n    _classPrivateFieldLooseBase(this, _eventEmitter)[_eventEmitter].emit(\"session-set\", _classPrivateFieldLooseBase(this, _session)[_session]);\n  }\n  document.cookie = \"hello_session=\".concat(_classPrivateFieldLooseBase(this, _session)[_session]);\n}\nfunction _get_cookie() {\n  var _document$cookie$matc;\n  return (_document$cookie$matc = document.cookie.match('(^|;)\\\\s*' + 'hello_session' + '\\\\s*=\\\\s*([^;]+)')) === null || _document$cookie$matc === void 0 ? void 0 : _document$cookie$matc.pop();\n}\nObject.defineProperty(Hellotext, _cookie, {\n  get: _get_cookie,\n  set: void 0\n});\nObject.defineProperty(Hellotext, _setSessionCookie, {\n  value: _setSessionCookie2\n});\nObject.defineProperty(Hellotext, _headers, {\n  get: _get_headers,\n  set: void 0\n});\nObject.defineProperty(Hellotext, _mintAnonymousSession, {\n  value: _mintAnonymousSession2\n});\nObject.defineProperty(Hellotext, _notInitialized, {\n  get: _get_notInitialized,\n  set: void 0\n});\nObject.defineProperty(Hellotext, _session, {\n  writable: true,\n  value: void 0\n});\nObject.defineProperty(Hellotext, _business, {\n  writable: true,\n  value: void 0\n});\nObject.defineProperty(Hellotext, _eventEmitter, {\n  writable: true,\n  value: new _eventEmitter2.default()\n});\nObject.defineProperty(Hellotext, _query, {\n  writable: true,\n  value: void 0\n});\nvar _default = Hellotext;\nexports[\"default\"] = _default;\n\n//# sourceURL=webpack://@hellotext/hellotext/./lib/hellotext.js?");

/***/ }),

/***/ "./lib/query.js":
/*!**********************!*\
  !*** ./lib/query.js ***!
  \**********************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n\nObject.defineProperty(exports, \"__esModule\", ({\n  value: true\n}));\nexports[\"default\"] = void 0;\nclass Query {\n  constructor(urlQueries) {\n    this.urlSearchParams = new URLSearchParams(urlQueries);\n  }\n  get(param) {\n    return this.urlSearchParams.get(this.toHellotextParam(param));\n  }\n  has(param) {\n    return this.urlSearchParams.has(this.toHellotextParam(param));\n  }\n  toHellotextParam(param) {\n    return \"hello_\".concat(param);\n  }\n}\nexports[\"default\"] = Query;\n\n//# sourceURL=webpack://@hellotext/hellotext/./lib/query.js?");

/***/ }),

/***/ "./lib/response.js":
/*!*************************!*\
  !*** ./lib/response.js ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\n\nObject.defineProperty(exports, \"__esModule\", ({\n  value: true\n}));\nexports[\"default\"] = void 0;\nfunction _classPrivateFieldLooseBase(receiver, privateKey) {\n  if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {\n    throw new TypeError(\"attempted to use private field on non-instance\");\n  }\n  return receiver;\n}\nvar id = 0;\nfunction _classPrivateFieldLooseKey(name) {\n  return \"__private_\" + id++ + \"_\" + name;\n}\nvar _success = /*#__PURE__*/_classPrivateFieldLooseKey(\"success\");\nvar _response = /*#__PURE__*/_classPrivateFieldLooseKey(\"response\");\nclass Response {\n  constructor(success, response) {\n    Object.defineProperty(this, _success, {\n      writable: true,\n      value: void 0\n    });\n    Object.defineProperty(this, _response, {\n      writable: true,\n      value: void 0\n    });\n    _classPrivateFieldLooseBase(this, _success)[_success] = success;\n    _classPrivateFieldLooseBase(this, _response)[_response] = response;\n  }\n  get data() {\n    return _classPrivateFieldLooseBase(this, _response)[_response];\n  }\n  get failed() {\n    return _classPrivateFieldLooseBase(this, _success)[_success] === false;\n  }\n  get succeeded() {\n    return _classPrivateFieldLooseBase(this, _success)[_success] === true;\n  }\n}\nexports[\"default\"] = Response;\n\n//# sourceURL=webpack://@hellotext/hellotext/./lib/response.js?");

/***/ }),

/***/ "./node_modules/whatwg-fetch/fetch.js":
/*!********************************************!*\
  !*** ./node_modules/whatwg-fetch/fetch.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"DOMException\": () => (/* binding */ DOMException),\n/* harmony export */   \"Headers\": () => (/* binding */ Headers),\n/* harmony export */   \"Request\": () => (/* binding */ Request),\n/* harmony export */   \"Response\": () => (/* binding */ Response),\n/* harmony export */   \"fetch\": () => (/* binding */ fetch)\n/* harmony export */ });\nvar global =\n  (typeof globalThis !== 'undefined' && globalThis) ||\n  (typeof self !== 'undefined' && self) ||\n  (typeof global !== 'undefined' && global)\n\nvar support = {\n  searchParams: 'URLSearchParams' in global,\n  iterable: 'Symbol' in global && 'iterator' in Symbol,\n  blob:\n    'FileReader' in global &&\n    'Blob' in global &&\n    (function() {\n      try {\n        new Blob()\n        return true\n      } catch (e) {\n        return false\n      }\n    })(),\n  formData: 'FormData' in global,\n  arrayBuffer: 'ArrayBuffer' in global\n}\n\nfunction isDataView(obj) {\n  return obj && DataView.prototype.isPrototypeOf(obj)\n}\n\nif (support.arrayBuffer) {\n  var viewClasses = [\n    '[object Int8Array]',\n    '[object Uint8Array]',\n    '[object Uint8ClampedArray]',\n    '[object Int16Array]',\n    '[object Uint16Array]',\n    '[object Int32Array]',\n    '[object Uint32Array]',\n    '[object Float32Array]',\n    '[object Float64Array]'\n  ]\n\n  var isArrayBufferView =\n    ArrayBuffer.isView ||\n    function(obj) {\n      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1\n    }\n}\n\nfunction normalizeName(name) {\n  if (typeof name !== 'string') {\n    name = String(name)\n  }\n  if (/[^a-z0-9\\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {\n    throw new TypeError('Invalid character in header field name: \"' + name + '\"')\n  }\n  return name.toLowerCase()\n}\n\nfunction normalizeValue(value) {\n  if (typeof value !== 'string') {\n    value = String(value)\n  }\n  return value\n}\n\n// Build a destructive iterator for the value list\nfunction iteratorFor(items) {\n  var iterator = {\n    next: function() {\n      var value = items.shift()\n      return {done: value === undefined, value: value}\n    }\n  }\n\n  if (support.iterable) {\n    iterator[Symbol.iterator] = function() {\n      return iterator\n    }\n  }\n\n  return iterator\n}\n\nfunction Headers(headers) {\n  this.map = {}\n\n  if (headers instanceof Headers) {\n    headers.forEach(function(value, name) {\n      this.append(name, value)\n    }, this)\n  } else if (Array.isArray(headers)) {\n    headers.forEach(function(header) {\n      this.append(header[0], header[1])\n    }, this)\n  } else if (headers) {\n    Object.getOwnPropertyNames(headers).forEach(function(name) {\n      this.append(name, headers[name])\n    }, this)\n  }\n}\n\nHeaders.prototype.append = function(name, value) {\n  name = normalizeName(name)\n  value = normalizeValue(value)\n  var oldValue = this.map[name]\n  this.map[name] = oldValue ? oldValue + ', ' + value : value\n}\n\nHeaders.prototype['delete'] = function(name) {\n  delete this.map[normalizeName(name)]\n}\n\nHeaders.prototype.get = function(name) {\n  name = normalizeName(name)\n  return this.has(name) ? this.map[name] : null\n}\n\nHeaders.prototype.has = function(name) {\n  return this.map.hasOwnProperty(normalizeName(name))\n}\n\nHeaders.prototype.set = function(name, value) {\n  this.map[normalizeName(name)] = normalizeValue(value)\n}\n\nHeaders.prototype.forEach = function(callback, thisArg) {\n  for (var name in this.map) {\n    if (this.map.hasOwnProperty(name)) {\n      callback.call(thisArg, this.map[name], name, this)\n    }\n  }\n}\n\nHeaders.prototype.keys = function() {\n  var items = []\n  this.forEach(function(value, name) {\n    items.push(name)\n  })\n  return iteratorFor(items)\n}\n\nHeaders.prototype.values = function() {\n  var items = []\n  this.forEach(function(value) {\n    items.push(value)\n  })\n  return iteratorFor(items)\n}\n\nHeaders.prototype.entries = function() {\n  var items = []\n  this.forEach(function(value, name) {\n    items.push([name, value])\n  })\n  return iteratorFor(items)\n}\n\nif (support.iterable) {\n  Headers.prototype[Symbol.iterator] = Headers.prototype.entries\n}\n\nfunction consumed(body) {\n  if (body.bodyUsed) {\n    return Promise.reject(new TypeError('Already read'))\n  }\n  body.bodyUsed = true\n}\n\nfunction fileReaderReady(reader) {\n  return new Promise(function(resolve, reject) {\n    reader.onload = function() {\n      resolve(reader.result)\n    }\n    reader.onerror = function() {\n      reject(reader.error)\n    }\n  })\n}\n\nfunction readBlobAsArrayBuffer(blob) {\n  var reader = new FileReader()\n  var promise = fileReaderReady(reader)\n  reader.readAsArrayBuffer(blob)\n  return promise\n}\n\nfunction readBlobAsText(blob) {\n  var reader = new FileReader()\n  var promise = fileReaderReady(reader)\n  reader.readAsText(blob)\n  return promise\n}\n\nfunction readArrayBufferAsText(buf) {\n  var view = new Uint8Array(buf)\n  var chars = new Array(view.length)\n\n  for (var i = 0; i < view.length; i++) {\n    chars[i] = String.fromCharCode(view[i])\n  }\n  return chars.join('')\n}\n\nfunction bufferClone(buf) {\n  if (buf.slice) {\n    return buf.slice(0)\n  } else {\n    var view = new Uint8Array(buf.byteLength)\n    view.set(new Uint8Array(buf))\n    return view.buffer\n  }\n}\n\nfunction Body() {\n  this.bodyUsed = false\n\n  this._initBody = function(body) {\n    /*\n      fetch-mock wraps the Response object in an ES6 Proxy to\n      provide useful test harness features such as flush. However, on\n      ES5 browsers without fetch or Proxy support pollyfills must be used;\n      the proxy-pollyfill is unable to proxy an attribute unless it exists\n      on the object before the Proxy is created. This change ensures\n      Response.bodyUsed exists on the instance, while maintaining the\n      semantic of setting Request.bodyUsed in the constructor before\n      _initBody is called.\n    */\n    this.bodyUsed = this.bodyUsed\n    this._bodyInit = body\n    if (!body) {\n      this._bodyText = ''\n    } else if (typeof body === 'string') {\n      this._bodyText = body\n    } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {\n      this._bodyBlob = body\n    } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {\n      this._bodyFormData = body\n    } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {\n      this._bodyText = body.toString()\n    } else if (support.arrayBuffer && support.blob && isDataView(body)) {\n      this._bodyArrayBuffer = bufferClone(body.buffer)\n      // IE 10-11 can't handle a DataView body.\n      this._bodyInit = new Blob([this._bodyArrayBuffer])\n    } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {\n      this._bodyArrayBuffer = bufferClone(body)\n    } else {\n      this._bodyText = body = Object.prototype.toString.call(body)\n    }\n\n    if (!this.headers.get('content-type')) {\n      if (typeof body === 'string') {\n        this.headers.set('content-type', 'text/plain;charset=UTF-8')\n      } else if (this._bodyBlob && this._bodyBlob.type) {\n        this.headers.set('content-type', this._bodyBlob.type)\n      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {\n        this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')\n      }\n    }\n  }\n\n  if (support.blob) {\n    this.blob = function() {\n      var rejected = consumed(this)\n      if (rejected) {\n        return rejected\n      }\n\n      if (this._bodyBlob) {\n        return Promise.resolve(this._bodyBlob)\n      } else if (this._bodyArrayBuffer) {\n        return Promise.resolve(new Blob([this._bodyArrayBuffer]))\n      } else if (this._bodyFormData) {\n        throw new Error('could not read FormData body as blob')\n      } else {\n        return Promise.resolve(new Blob([this._bodyText]))\n      }\n    }\n\n    this.arrayBuffer = function() {\n      if (this._bodyArrayBuffer) {\n        var isConsumed = consumed(this)\n        if (isConsumed) {\n          return isConsumed\n        }\n        if (ArrayBuffer.isView(this._bodyArrayBuffer)) {\n          return Promise.resolve(\n            this._bodyArrayBuffer.buffer.slice(\n              this._bodyArrayBuffer.byteOffset,\n              this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength\n            )\n          )\n        } else {\n          return Promise.resolve(this._bodyArrayBuffer)\n        }\n      } else {\n        return this.blob().then(readBlobAsArrayBuffer)\n      }\n    }\n  }\n\n  this.text = function() {\n    var rejected = consumed(this)\n    if (rejected) {\n      return rejected\n    }\n\n    if (this._bodyBlob) {\n      return readBlobAsText(this._bodyBlob)\n    } else if (this._bodyArrayBuffer) {\n      return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer))\n    } else if (this._bodyFormData) {\n      throw new Error('could not read FormData body as text')\n    } else {\n      return Promise.resolve(this._bodyText)\n    }\n  }\n\n  if (support.formData) {\n    this.formData = function() {\n      return this.text().then(decode)\n    }\n  }\n\n  this.json = function() {\n    return this.text().then(JSON.parse)\n  }\n\n  return this\n}\n\n// HTTP methods whose capitalization should be normalized\nvar methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']\n\nfunction normalizeMethod(method) {\n  var upcased = method.toUpperCase()\n  return methods.indexOf(upcased) > -1 ? upcased : method\n}\n\nfunction Request(input, options) {\n  if (!(this instanceof Request)) {\n    throw new TypeError('Please use the \"new\" operator, this DOM object constructor cannot be called as a function.')\n  }\n\n  options = options || {}\n  var body = options.body\n\n  if (input instanceof Request) {\n    if (input.bodyUsed) {\n      throw new TypeError('Already read')\n    }\n    this.url = input.url\n    this.credentials = input.credentials\n    if (!options.headers) {\n      this.headers = new Headers(input.headers)\n    }\n    this.method = input.method\n    this.mode = input.mode\n    this.signal = input.signal\n    if (!body && input._bodyInit != null) {\n      body = input._bodyInit\n      input.bodyUsed = true\n    }\n  } else {\n    this.url = String(input)\n  }\n\n  this.credentials = options.credentials || this.credentials || 'same-origin'\n  if (options.headers || !this.headers) {\n    this.headers = new Headers(options.headers)\n  }\n  this.method = normalizeMethod(options.method || this.method || 'GET')\n  this.mode = options.mode || this.mode || null\n  this.signal = options.signal || this.signal\n  this.referrer = null\n\n  if ((this.method === 'GET' || this.method === 'HEAD') && body) {\n    throw new TypeError('Body not allowed for GET or HEAD requests')\n  }\n  this._initBody(body)\n\n  if (this.method === 'GET' || this.method === 'HEAD') {\n    if (options.cache === 'no-store' || options.cache === 'no-cache') {\n      // Search for a '_' parameter in the query string\n      var reParamSearch = /([?&])_=[^&]*/\n      if (reParamSearch.test(this.url)) {\n        // If it already exists then set the value with the current time\n        this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime())\n      } else {\n        // Otherwise add a new '_' parameter to the end with the current time\n        var reQueryString = /\\?/\n        this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime()\n      }\n    }\n  }\n}\n\nRequest.prototype.clone = function() {\n  return new Request(this, {body: this._bodyInit})\n}\n\nfunction decode(body) {\n  var form = new FormData()\n  body\n    .trim()\n    .split('&')\n    .forEach(function(bytes) {\n      if (bytes) {\n        var split = bytes.split('=')\n        var name = split.shift().replace(/\\+/g, ' ')\n        var value = split.join('=').replace(/\\+/g, ' ')\n        form.append(decodeURIComponent(name), decodeURIComponent(value))\n      }\n    })\n  return form\n}\n\nfunction parseHeaders(rawHeaders) {\n  var headers = new Headers()\n  // Replace instances of \\r\\n and \\n followed by at least one space or horizontal tab with a space\n  // https://tools.ietf.org/html/rfc7230#section-3.2\n  var preProcessedHeaders = rawHeaders.replace(/\\r?\\n[\\t ]+/g, ' ')\n  // Avoiding split via regex to work around a common IE11 bug with the core-js 3.6.0 regex polyfill\n  // https://github.com/github/fetch/issues/748\n  // https://github.com/zloirock/core-js/issues/751\n  preProcessedHeaders\n    .split('\\r')\n    .map(function(header) {\n      return header.indexOf('\\n') === 0 ? header.substr(1, header.length) : header\n    })\n    .forEach(function(line) {\n      var parts = line.split(':')\n      var key = parts.shift().trim()\n      if (key) {\n        var value = parts.join(':').trim()\n        headers.append(key, value)\n      }\n    })\n  return headers\n}\n\nBody.call(Request.prototype)\n\nfunction Response(bodyInit, options) {\n  if (!(this instanceof Response)) {\n    throw new TypeError('Please use the \"new\" operator, this DOM object constructor cannot be called as a function.')\n  }\n  if (!options) {\n    options = {}\n  }\n\n  this.type = 'default'\n  this.status = options.status === undefined ? 200 : options.status\n  this.ok = this.status >= 200 && this.status < 300\n  this.statusText = options.statusText === undefined ? '' : '' + options.statusText\n  this.headers = new Headers(options.headers)\n  this.url = options.url || ''\n  this._initBody(bodyInit)\n}\n\nBody.call(Response.prototype)\n\nResponse.prototype.clone = function() {\n  return new Response(this._bodyInit, {\n    status: this.status,\n    statusText: this.statusText,\n    headers: new Headers(this.headers),\n    url: this.url\n  })\n}\n\nResponse.error = function() {\n  var response = new Response(null, {status: 0, statusText: ''})\n  response.type = 'error'\n  return response\n}\n\nvar redirectStatuses = [301, 302, 303, 307, 308]\n\nResponse.redirect = function(url, status) {\n  if (redirectStatuses.indexOf(status) === -1) {\n    throw new RangeError('Invalid status code')\n  }\n\n  return new Response(null, {status: status, headers: {location: url}})\n}\n\nvar DOMException = global.DOMException\ntry {\n  new DOMException()\n} catch (err) {\n  DOMException = function(message, name) {\n    this.message = message\n    this.name = name\n    var error = Error(message)\n    this.stack = error.stack\n  }\n  DOMException.prototype = Object.create(Error.prototype)\n  DOMException.prototype.constructor = DOMException\n}\n\nfunction fetch(input, init) {\n  return new Promise(function(resolve, reject) {\n    var request = new Request(input, init)\n\n    if (request.signal && request.signal.aborted) {\n      return reject(new DOMException('Aborted', 'AbortError'))\n    }\n\n    var xhr = new XMLHttpRequest()\n\n    function abortXhr() {\n      xhr.abort()\n    }\n\n    xhr.onload = function() {\n      var options = {\n        status: xhr.status,\n        statusText: xhr.statusText,\n        headers: parseHeaders(xhr.getAllResponseHeaders() || '')\n      }\n      options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL')\n      var body = 'response' in xhr ? xhr.response : xhr.responseText\n      setTimeout(function() {\n        resolve(new Response(body, options))\n      }, 0)\n    }\n\n    xhr.onerror = function() {\n      setTimeout(function() {\n        reject(new TypeError('Network request failed'))\n      }, 0)\n    }\n\n    xhr.ontimeout = function() {\n      setTimeout(function() {\n        reject(new TypeError('Network request failed'))\n      }, 0)\n    }\n\n    xhr.onabort = function() {\n      setTimeout(function() {\n        reject(new DOMException('Aborted', 'AbortError'))\n      }, 0)\n    }\n\n    function fixUrl(url) {\n      try {\n        return url === '' && global.location.href ? global.location.href : url\n      } catch (e) {\n        return url\n      }\n    }\n\n    xhr.open(request.method, fixUrl(request.url), true)\n\n    if (request.credentials === 'include') {\n      xhr.withCredentials = true\n    } else if (request.credentials === 'omit') {\n      xhr.withCredentials = false\n    }\n\n    if ('responseType' in xhr) {\n      if (support.blob) {\n        xhr.responseType = 'blob'\n      } else if (\n        support.arrayBuffer &&\n        request.headers.get('Content-Type') &&\n        request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1\n      ) {\n        xhr.responseType = 'arraybuffer'\n      }\n    }\n\n    if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {\n      Object.getOwnPropertyNames(init.headers).forEach(function(name) {\n        xhr.setRequestHeader(name, normalizeValue(init.headers[name]))\n      })\n    } else {\n      request.headers.forEach(function(value, name) {\n        xhr.setRequestHeader(name, value)\n      })\n    }\n\n    if (request.signal) {\n      request.signal.addEventListener('abort', abortXhr)\n\n      xhr.onreadystatechange = function() {\n        // DONE (success or failure)\n        if (xhr.readyState === 4) {\n          request.signal.removeEventListener('abort', abortXhr)\n        }\n      }\n    }\n\n    xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)\n  })\n}\n\nfetch.polyfill = true\n\nif (!global.fetch) {\n  global.fetch = fetch\n  global.Headers = Headers\n  global.Request = Request\n  global.Response = Response\n}\n\n\n//# sourceURL=webpack://@hellotext/hellotext/./node_modules/whatwg-fetch/fetch.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	__webpack_require__("./node_modules/whatwg-fetch/fetch.js");
/******/ 	var __webpack_exports__ = __webpack_require__("./lib/hellotext.js");
/******/ 	
/******/ })()
;