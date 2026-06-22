"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core/index.cjs");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let ApplicationChannel = /*#__PURE__*/function () {
  function ApplicationChannel() {
    _classCallCheck(this, ApplicationChannel);
    ApplicationChannel.channels.add(this);
  }
  _createClass(ApplicationChannel, [{
    key: "send",
    value: function send({
      command,
      identifier,
      data
    }) {
      const payload = {
        command,
        identifier: JSON.stringify(identifier),
        data: JSON.stringify(data || {})
      };
      const socket = ApplicationChannel.ensureWebSocket();
      const message = JSON.stringify(payload);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
      } else {
        socket.addEventListener('open', () => {
          socket.send(message);
        });
      }
    }
  }, {
    key: "onMessage",
    value: function onMessage(callback) {
      const handler = event => {
        const data = JSON.parse(event.data);
        const {
          type,
          message
        } = data;
        if (this.ignoredEvents.includes(type)) {
          return;
        }
        callback(message);
      };
      ApplicationChannel.messageHandlers.add(handler);
      ApplicationChannel.ensureWebSocket().addEventListener('message', handler);
    }
  }, {
    key: "onDisconnect",
    value: function onDisconnect(callback) {
      ApplicationChannel.disconnectHandlers.add(callback);
    }
  }, {
    key: "onSubscriptionConfirmed",
    value: function onSubscriptionConfirmed(callback) {
      ApplicationChannel.subscriptionConfirmHandlers.add(callback);
    }
  }, {
    key: "webSocket",
    get: function () {
      return ApplicationChannel.ensureWebSocket();
    }
  }, {
    key: "ignoredEvents",
    get: function () {
      return ['ping', 'confirm_subscription', 'welcome'];
    }
  }], [{
    key: "ensureWebSocket",
    value: function ensureWebSocket() {
      if (this.webSocket && !this.closedWebSocket(this.webSocket)) {
        return this.webSocket;
      }
      if (this.webSocket) {
        this.needsResubscribe = true;
      }
      return this.openWebSocket();
    }
  }, {
    key: "openWebSocket",
    value: function openWebSocket() {
      this.clearReconnectTimeout();
      const socket = new WebSocket(_core.Configuration.actionCableUrl);
      this.webSocket = socket;
      this.installWebSocketHandlers(socket);
      return socket;
    }
  }, {
    key: "installWebSocketHandlers",
    value: function installWebSocketHandlers(socket) {
      socket.addEventListener('open', () => this.handleOpen(socket));
      socket.addEventListener('close', () => this.handleDisconnect(socket));
      socket.addEventListener('error', () => this.handleDisconnect(socket));
      socket.addEventListener('message', event => this.handleControlMessage(event));
      this.messageHandlers.forEach(handler => {
        socket.addEventListener('message', handler);
      });
    }
  }, {
    key: "handleOpen",
    value: function handleOpen(socket) {
      if (socket !== this.webSocket) {
        return;
      }
      this.reconnectAttempts = 0;
      if (!this.needsResubscribe) {
        return;
      }
      this.needsResubscribe = false;
      this.resubscribeChannels();
    }
  }, {
    key: "handleControlMessage",
    value: function handleControlMessage(event) {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (data.type !== 'confirm_subscription') {
        return;
      }
      this.subscriptionConfirmHandlers.forEach(callback => callback(data.identifier));
    }
  }, {
    key: "handleDisconnect",
    value: function handleDisconnect(socket) {
      if (socket !== this.webSocket) {
        return;
      }
      this.disconnectHandlers.forEach(callback => callback());
      this.webSocket = null;
      this.needsResubscribe = true;
      this.scheduleReconnect();
    }
  }, {
    key: "scheduleReconnect",
    value: function scheduleReconnect() {
      if (this.reconnectTimeout) {
        return;
      }
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null;
        this.reconnectAttempts += 1;
        this.openWebSocket();
      }, this.reconnectDelay);
    }
  }, {
    key: "clearReconnectTimeout",
    value: function clearReconnectTimeout() {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    }
  }, {
    key: "resubscribeChannels",
    value: function resubscribeChannels() {
      this.channels.forEach(channel => {
        const resubscribe = channel.resubscribe || channel.subscribe;
        if (typeof resubscribe === 'function') {
          resubscribe.call(channel);
        }
      });
    }
  }, {
    key: "closedWebSocket",
    value: function closedWebSocket(socket) {
      return socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING;
    }
  }, {
    key: "reconnectDelay",
    get: function () {
      const delay = Math.min(this.reconnectMaxDelay, this.reconnectBaseDelay * 2 ** this.reconnectAttempts);
      const jitter = Math.round(delay * this.reconnectJitter * Math.random());
      return delay + jitter;
    }
  }]);
  return ApplicationChannel;
}();
ApplicationChannel.webSocket = void 0;
ApplicationChannel.channels = new Set();
ApplicationChannel.messageHandlers = new Set();
ApplicationChannel.disconnectHandlers = new Set();
ApplicationChannel.subscriptionConfirmHandlers = new Set();
ApplicationChannel.reconnectTimeout = null;
ApplicationChannel.reconnectAttempts = 0;
ApplicationChannel.reconnectBaseDelay = 500;
ApplicationChannel.reconnectMaxDelay = 10000;
ApplicationChannel.reconnectJitter = 0.3;
ApplicationChannel.needsResubscribe = false;
var _default = ApplicationChannel;
exports.default = _default;