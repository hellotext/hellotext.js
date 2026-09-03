"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let ApplicationChannel = /*#__PURE__*/function () {
  function ApplicationChannel() {
    _classCallCheck(this, ApplicationChannel);
    ApplicationChannel.channels.add(this);
  }
  return _createClass(ApplicationChannel, [{
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
var _default = exports.default = ApplicationChannel;