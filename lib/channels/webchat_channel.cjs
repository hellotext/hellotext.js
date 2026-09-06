"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _application_channel = _interopRequireDefault(require("./application_channel"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class WebchatChannel extends _application_channel.default {
  constructor(id, session, conversation) {
    super();
    this.id = id;
    this.session = session;
    this.conversation = conversation;
    // Keep our own subscription intent instead of trusting the socket state.
    // The shared WebSocket can reconnect independently, but an explicit
    // unsubscribe means this channel should not silently join again.
    this.subscribed = false;
    this.awaitingReconnectConfirmation = false;
    this.reconnectCallbacks = new Set();

    // ActionCable confirms subscriptions at the socket level. This channel
    // listens for those confirmations so the controller can wait until Rails has
    // accepted this exact WebchatChannel subscription before fetching missed
    // messages from the REST catch-up endpoint.
    this.onSubscriptionConfirmed(identifier => this.handleSubscriptionConfirmed(identifier));
    this.subscribe();
  }
  subscribe() {
    this.subscribed = true;
    const params = {
      channel: 'WebchatChannel',
      id: this.id,
      session: this.session,
      conversation: this.conversation
    };
    this.send({
      command: 'subscribe',
      identifier: params
    });
  }
  unsubscribe() {
    this.subscribed = false;
    const params = {
      channel: 'WebchatChannel',
      id: this.id,
      session: this.session,
      conversation: this.conversation
    };
    this.send({
      command: 'unsubscribe',
      identifier: params
    });
  }
  resubscribe() {
    if (this.subscribed === false) return;

    // Reconnect recovery has two phases: send the subscription command first,
    // then wait for ActionCable to confirm it. Catch-up work should run after
    // that confirmation so broadcasts and REST backfill are pointed at the same
    // live conversation subscription.
    this.awaitingReconnectConfirmation = true;
    this.subscribe();
  }
  onReconnect(callback) {
    this.reconnectCallbacks.add(callback);
  }
  handleSubscriptionConfirmed(identifier) {
    if (!this.awaitingReconnectConfirmation || !this.matchesIdentifier(identifier)) return;

    // Only the first matching confirmation completes the reconnect cycle. This
    // prevents unrelated subscription confirmations on the shared socket from
    // triggering duplicate catch-up requests.
    this.awaitingReconnectConfirmation = false;
    this.reconnectCallbacks.forEach(callback => callback());
  }
  matchesIdentifier(identifier) {
    let params;
    try {
      params = typeof identifier === 'string' ? JSON.parse(identifier) : identifier;
    } catch {
      return false;
    }

    // ActionCable sends the same identifier payload we used when subscribing.
    // Matching every routing key keeps a confirmation for another webchat,
    // session, or conversation from being treated as this channel's reconnect.
    return params.channel === 'WebchatChannel' && params.id === this.id && params.session === this.session && params.conversation === this.conversation;
  }
  startTypingIndicator() {
    const params = {
      channel: 'WebchatChannel',
      id: this.id,
      session: this.session,
      conversation: this.conversation
    };
    this.send({
      command: 'message',
      identifier: params,
      data: {
        action: 'started_typing'
      }
    });
  }
  stopTypingIndicator() {
    const params = {
      channel: 'WebchatChannel',
      id: this.id,
      session: this.session,
      conversation: this.conversation
    };
    this.send({
      command: 'typing:stop',
      identifier: params,
      data: {
        action: 'stopped_typing'
      }
    });
  }
  onMessage(callback) {
    super.onMessage(message => {
      if (message.type !== 'message') return;
      callback(message);
    });
  }
  onReaction(callback) {
    super.onMessage(message => {
      if (message.type === 'reaction.create' || message.type === 'reaction.destroy') {
        callback(message);
      }
    });
  }
  onTypingStart(callback) {
    super.onMessage(message => {
      if (message.type === 'started_typing') {
        callback(message);
      }
    });
  }
  updateSubscriptionWith(conversation) {
    this.unsubscribe();
    setTimeout(() => {
      this.conversation = conversation;
      this.subscribe();
    }, 1000);
  }
}
var _default = WebchatChannel;
exports.default = _default;