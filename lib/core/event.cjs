"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _errors = require("../errors");
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let Event = exports.default = /*#__PURE__*/function () {
  function Event() {
    _classCallCheck(this, Event);
    this.subscribers = {};
  }
  return _createClass(Event, [{
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
      (_this$subscribers$eve = this.subscribers[eventName]) === null || _this$subscribers$eve === void 0 || _this$subscribers$eve.forEach(subscriber => {
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
}();
Event.events = ['session-set', 'utm-set', 'forms:collected', 'form:completed', 'webchat:mounted', 'webchat:opened', 'webchat:closed', 'webchat:message:sent', 'webchat:message:received', 'cart.added'];