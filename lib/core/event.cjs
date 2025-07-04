"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _errors = require("../errors");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let Event = /*#__PURE__*/function () {
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
      this.subscribers = {
        ...this.subscribers,
        [eventName]: this.subscribers[eventName] ? [...this.subscribers[eventName], callback] : [callback]
      };
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
    get: function () {
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
Event.events = ['session-set', 'forms:collected', 'form:completed', 'webchat:mounted', 'webchat:opened', 'webchat:closed', 'webchat:message:sent', 'webchat:message:received'];