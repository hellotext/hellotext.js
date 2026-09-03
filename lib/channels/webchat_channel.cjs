"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _application_channel = _interopRequireDefault(require("./application_channel"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function () { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
let WebchatChannel = /*#__PURE__*/function (_ApplicationChannel) {
  function WebchatChannel(id, session, conversation) {
    var _this;
    _classCallCheck(this, WebchatChannel);
    _this = _callSuper(this, WebchatChannel);
    _this.id = id;
    _this.session = session;
    _this.conversation = conversation;
    // Keep our own subscription intent instead of trusting the socket state.
    // The shared WebSocket can reconnect independently, but an explicit
    // unsubscribe means this channel should not silently join again.
    _this.subscribed = false;
    _this.awaitingReconnectConfirmation = false;
    _this.reconnectCallbacks = new Set();

    // ActionCable confirms subscriptions at the socket level. This channel
    // listens for those confirmations so the controller can wait until Rails has
    // accepted this exact WebchatChannel subscription before fetching missed
    // messages from the REST catch-up endpoint.
    _this.onSubscriptionConfirmed(identifier => _this.handleSubscriptionConfirmed(identifier));
    _this.subscribe();
    return _this;
  }
  _inherits(WebchatChannel, _ApplicationChannel);
  return _createClass(WebchatChannel, [{
    key: "subscribe",
    value: function subscribe() {
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
  }, {
    key: "unsubscribe",
    value: function unsubscribe() {
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
  }, {
    key: "resubscribe",
    value: function resubscribe() {
      if (this.subscribed === false) return;

      // Reconnect recovery has two phases: send the subscription command first,
      // then wait for ActionCable to confirm it. Catch-up work should run after
      // that confirmation so broadcasts and REST backfill are pointed at the same
      // live conversation subscription.
      this.awaitingReconnectConfirmation = true;
      this.subscribe();
    }
  }, {
    key: "onReconnect",
    value: function onReconnect(callback) {
      this.reconnectCallbacks.add(callback);
    }
  }, {
    key: "handleSubscriptionConfirmed",
    value: function handleSubscriptionConfirmed(identifier) {
      if (!this.awaitingReconnectConfirmation || !this.matchesIdentifier(identifier)) return;

      // Only the first matching confirmation completes the reconnect cycle. This
      // prevents unrelated subscription confirmations on the shared socket from
      // triggering duplicate catch-up requests.
      this.awaitingReconnectConfirmation = false;
      this.reconnectCallbacks.forEach(callback => callback());
    }
  }, {
    key: "matchesIdentifier",
    value: function matchesIdentifier(identifier) {
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
  }, {
    key: "startTypingIndicator",
    value: function startTypingIndicator() {
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
  }, {
    key: "stopTypingIndicator",
    value: function stopTypingIndicator() {
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
  }, {
    key: "onMessage",
    value: function onMessage(callback) {
      _superPropGet(WebchatChannel, "onMessage", this, 3)([message => {
        if (message.type !== 'message') return;
        callback(message);
      }]);
    }
  }, {
    key: "onReaction",
    value: function onReaction(callback) {
      _superPropGet(WebchatChannel, "onMessage", this, 3)([message => {
        if (message.type === 'reaction.create' || message.type === 'reaction.destroy') {
          callback(message);
        }
      }]);
    }
  }, {
    key: "onTypingStart",
    value: function onTypingStart(callback) {
      _superPropGet(WebchatChannel, "onMessage", this, 3)([message => {
        if (message.type === 'started_typing') {
          callback(message);
        }
      }]);
    }
  }, {
    key: "updateSubscriptionWith",
    value: function updateSubscriptionWith(conversation) {
      this.unsubscribe();
      setTimeout(() => {
        this.conversation = conversation;
        this.subscribe();
      }, 1000);
    }
  }]);
}(_application_channel.default);
var _default = exports.default = WebchatChannel;