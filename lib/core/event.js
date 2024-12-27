"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _errors = require("../errors");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Event = /*#__PURE__*/function () {
  function Event() {
    _classCallCheck(this, Event);
    this.subscribers = {};
  }
  _createClass(Event, [{
    key: "addSubscriber",
    value: function addSubscriber(eventName, callback) {
      if (Event.invalid(eventName)) {
        throw new _errors.InvalidEvent(eventName);
      }
      this.subscribers = _objectSpread(_objectSpread({}, this.subscribers), {}, {
        [eventName]: this.subscribers[eventName] ? [...this.subscribers[eventName], callback] : [callback]
      });
    }
  }, {
    key: "removeSubscriber",
    value: function removeSubscriber(eventName, callback) {
      if (Event.invalid(eventName)) {
        throw new _errors.InvalidEvent(eventName);
      }
      if (this.subscribers[eventName]) {
        this.subscribers[eventName] = this.subscribers[eventName].filter(cb => cb !== callback);
      }
    }
  }, {
    key: "dispatch",
    value: function dispatch(eventName, data) {
      var _this$subscribers$eve;
      (_this$subscribers$eve = this.subscribers[eventName]) === null || _this$subscribers$eve === void 0 ? void 0 : _this$subscribers$eve.forEach(subscriber => {
        subscriber(data);
      });
    }
  }, {
    key: "listeners",
    get: function get() {
      return Object.keys(this.subscribers).length !== 0;
    }
  }], [{
    key: "valid",
    value: function valid(name) {
      return Event.exists(name);
    }
  }, {
    key: "invalid",
    value: function invalid(name) {
      return !this.valid(name);
    }
  }, {
    key: "exists",
    value: function exists(name) {
      return this.events.find(eventName => eventName === name) !== undefined;
    }
  }]);
  return Event;
}();
exports.default = Event;
Event.events = ['session-set', 'forms:collected', 'form:completed', 'webchat:loaded', 'webchat:mounted', 'webchat:opened', 'webchat:closed', 'webchat:message:sent', 'webchat:message:received'];