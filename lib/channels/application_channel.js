"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ApplicationChannel = /*#__PURE__*/function () {
  function ApplicationChannel() {
    _classCallCheck(this, ApplicationChannel);
  }
  _createClass(ApplicationChannel, [{
    key: "send",
    value: function send(_ref) {
      var {
        command,
        identifier
      } = _ref;
      var data = {
        command,
        identifier: JSON.stringify(identifier)
      };
      if (this.webSocket.readyState === WebSocket.OPEN) {
        this.webSocket.send(JSON.stringify(data));
      } else {
        this.webSocket.addEventListener('open', () => {
          this.webSocket.send(JSON.stringify(data));
        });
      }
    }
  }, {
    key: "onMessage",
    value: function onMessage(callback) {
      this.webSocket.addEventListener('message', event => {
        var data = JSON.parse(event.data);
        var {
          type,
          message
        } = data;
        if (this.ignoredEvents.includes(type)) {
          return;
        }
        callback(message);
      });
    }
  }, {
    key: "webSocket",
    get: function get() {
      if (!ApplicationChannel.webSocket) {
        return ApplicationChannel.webSocket = new WebSocket("wss://www.hellotext.com/cable");
      }
      return ApplicationChannel.webSocket;
    }
  }, {
    key: "ignoredEvents",
    get: function get() {
      return ['ping', 'confirm_subscription', 'welcome'];
    }
  }]);
  return ApplicationChannel;
}();
ApplicationChannel.webSocket = void 0;
var _default = ApplicationChannel;
exports.default = _default;