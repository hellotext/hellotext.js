"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
class ApplicationChannel {
  static webSocket;
  static channels = new Set();
  static messageHandlers = new Set();
  static disconnectHandlers = new Set();
  static subscriptionConfirmHandlers = new Set();
  static reconnectTimeout = null;
  static reconnectAttempts = 0;
  static reconnectBaseDelay = 500;
  static reconnectMaxDelay = 10000;
  static reconnectJitter = 0.3;
  static needsResubscribe = false;
  constructor() {
    ApplicationChannel.channels.add(this);
  }
  send({
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
  onMessage(callback) {
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
  onDisconnect(callback) {
    ApplicationChannel.disconnectHandlers.add(callback);
  }
  onSubscriptionConfirmed(callback) {
    ApplicationChannel.subscriptionConfirmHandlers.add(callback);
  }
  get webSocket() {
    return ApplicationChannel.ensureWebSocket();
  }
  static ensureWebSocket() {
    if (this.webSocket && !this.closedWebSocket(this.webSocket)) {
      return this.webSocket;
    }
    if (this.webSocket) {
      this.needsResubscribe = true;
    }
    return this.openWebSocket();
  }
  static openWebSocket() {
    this.clearReconnectTimeout();
    const socket = new WebSocket(_core.Configuration.actionCableUrl);
    this.webSocket = socket;
    this.installWebSocketHandlers(socket);
    return socket;
  }
  static installWebSocketHandlers(socket) {
    socket.addEventListener('open', () => this.handleOpen(socket));
    socket.addEventListener('close', () => this.handleDisconnect(socket));
    socket.addEventListener('error', () => this.handleDisconnect(socket));
    socket.addEventListener('message', event => this.handleControlMessage(event));
    this.messageHandlers.forEach(handler => {
      socket.addEventListener('message', handler);
    });
  }
  static handleOpen(socket) {
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
  static handleControlMessage(event) {
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
  static handleDisconnect(socket) {
    if (socket !== this.webSocket) {
      return;
    }
    this.disconnectHandlers.forEach(callback => callback());
    this.webSocket = null;
    this.needsResubscribe = true;
    this.scheduleReconnect();
  }
  static scheduleReconnect() {
    if (this.reconnectTimeout) {
      return;
    }
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.reconnectAttempts += 1;
      this.openWebSocket();
    }, this.reconnectDelay);
  }
  static clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  static resubscribeChannels() {
    this.channels.forEach(channel => {
      const resubscribe = channel.resubscribe || channel.subscribe;
      if (typeof resubscribe === 'function') {
        resubscribe.call(channel);
      }
    });
  }
  static closedWebSocket(socket) {
    return socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING;
  }
  static get reconnectDelay() {
    const delay = Math.min(this.reconnectMaxDelay, this.reconnectBaseDelay * 2 ** this.reconnectAttempts);
    const jitter = Math.round(delay * this.reconnectJitter * Math.random());
    return delay + jitter;
  }
  get ignoredEvents() {
    return ['ping', 'confirm_subscription', 'welcome'];
  }
}
var _default = ApplicationChannel;
exports.default = _default;