"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Activity = void 0;
var _activity_channel = _interopRequireDefault(require("../channels/activity_channel"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let Activity = /*#__PURE__*/function () {
  function Activity() {
    _classCallCheck(this, Activity);
    this.channel = new _activity_channel.default();
    this.setup();
  }
  _createClass(Activity, [{
    key: "setup",
    value: function setup() {
      this.throttledEvents.forEach(event => {
        document.addEventListener(event, this.throttle(() => this.recordActivity(event), 5000));
      });
      this.immediateEvents.forEach(event => {
        document.addEventListener(event, () => {
          this.recordActivity(event);
        });
      });
    }

    /**
     * Throttle function to limit how often a function can be called
     * @param {Function} func - Function to throttle
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} - Throttled function
     */
  }, {
    key: "throttle",
    value: function throttle(func, delay) {
      let timeoutId;
      let lastExecTime = 0;
      return (...args) => {
        const currentTime = Date.now();
        if (currentTime - lastExecTime > delay) {
          func.apply(this, args);
          lastExecTime = currentTime;
        } else {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            func.apply(this, args);
            lastExecTime = Date.now();
          }, delay - (currentTime - lastExecTime));
        }
      };
    }

    /**
     * Records user activity by sending it to the server via ActionCable
     * @param {string} eventType - Type of event that occurred
     */
  }, {
    key: "recordActivity",
    value: function recordActivity(eventType) {
      if (!this.channel || !this.channel.connected()) {
        return;
      }
      this.channel.sendHeartbeat();
    }

    /**
     * Cleanup method to remove event listeners and close connections
     */
  }, {
    key: "destroy",
    value: function destroy() {
      this.throttledEvents.forEach(event => document.removeEventListener(event, this.throttle));
      this.immediateEvents.forEach(event => document.removeEventListener(event, this.recordActivity));
      if (this.channel) {
        this.channel.unsubscribe();
      }
    }
  }, {
    key: "immediateEvents",
    get: function () {
      return ['click', 'keydown', 'submit', 'input', 'change'];
    }
  }, {
    key: "throttledEvents",
    get: function () {
      return ['scroll', 'mousemove', 'touchmove'];
    }
  }]);
  return Activity;
}();
exports.Activity = Activity;