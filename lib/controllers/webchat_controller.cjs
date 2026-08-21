"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dom = require("@floating-ui/dom");
var _stimulus = require("@hotwired/stimulus");
var _messages2 = _interopRequireDefault(require("../api/webchat/messages"));
var _webchat_channel = _interopRequireDefault(require("../channels/webchat_channel"));
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _core = require("../core");
var _webchat = require("../core/configuration/webchat");
var _sanitize_html = require("../core/sanitize_html");
var _usePopover = require("./mixins/usePopover");
var _useBehaviour = require("./webchat/useBehaviour");
var _useOpeningSequence = require("./webchat/useOpeningSequence");
var _useTeaser = require("./webchat/useTeaser");
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
const POPOVER_ANIMATION_DURATION = 120;
const MESSAGE_TIMESTAMP_FORMAT_OPTIONS = {
  hour: 'numeric',
  minute: '2-digit'
};
const MOBILE_USER_AGENT_PATTERN = /Android|iPhone|iPad|iPod/i;
const SCROLL_ISOLATION_EVENT_OPTIONS = {
  capture: true,
  passive: true
};
let _default = exports.default = /*#__PURE__*/function (_Controller) {
  function _default() {
    _classCallCheck(this, _default);
    return _callSuper(this, _default, arguments);
  }
  _inherits(_default, _Controller);
  return _createClass(_default, [{
    key: "initialize",
    value: function initialize() {
      this.messagesAPI = new _messages2.default(this.idValue);
      this.webChatChannel = new _webchat_channel.default(this.idValue, _hellotext.default.session, this.conversationIdValue);
      this.files = [];
      this.messageIds = new Set();
      this.catchUpAfterMessageId = null;
      this.fetchingCatchUpMessages = false;
      this.onMessageReceived = this.onMessageReceived.bind(this);
      this.onMessageReaction = this.onMessageReaction.bind(this);
      this.onTypingStart = this.onTypingStart.bind(this);
      this.captureCatchUpCursor = this.captureCatchUpCursor.bind(this);
      this.catchUpMessages = this.catchUpMessages.bind(this);
      this.onScroll = this.onScroll.bind(this);
      this.onOutboundMessageSent = this.onOutboundMessageSent.bind(this);
      this.closePopoverOnEscape = this.closePopoverOnEscape.bind(this);
      this.broadcastChannel = new BroadcastChannel(`hellotext--webchat--${this.idValue}`);
      this.webChatChannel.onDisconnect(this.captureCatchUpCursor);
      this.webChatChannel.onReconnect(this.catchUpMessages);
      _superPropGet(_default, "initialize", this, 3)([]);
    }
  }, {
    key: "connect",
    value: function connect() {
      (0, _useBehaviour.useBehaviour)(this);
      (0, _usePopover.usePopover)(this);
      (0, _useOpeningSequence.useOpeningSequence)(this);
      (0, _useTeaser.useTeaser)(this);
      this.setupFloatingUI({
        trigger: this.triggerTarget,
        popover: this.popoverTarget
      });
      if (this.hasTeaserTarget) {
        this.setupFloatingUI({
          trigger: this.triggerTarget,
          popover: this.teaserTarget,
          strategy: 'absolute'
        });
      }
      this.setupTeaser();
      this.setupOpeningSequence();
      this.localizeMessageTimestamps();
      this.webChatChannel.onMessage(this.onMessageReceived);
      this.webChatChannel.onTypingStart(this.onTypingStart);
      this.webChatChannel.onReaction(this.onMessageReaction);
      this.setupMessagesContainerScrollIsolation();
      this.messagesContainerTarget.addEventListener('scroll', this.onScroll);
      this.messagesContainerTarget.addEventListener('wheel', this.stopHostScrollPropagation, SCROLL_ISOLATION_EVENT_OPTIONS);
      this.messagesContainerTarget.addEventListener('touchmove', this.stopHostScrollPropagation, SCROLL_ISOLATION_EVENT_OPTIONS);
      if (this.shouldOpenOnMount) {
        this.openValue = true;
      }
      _hellotext.default.eventEmitter.dispatch('webchat:mounted');
      this.broadcastChannel.addEventListener('message', this.onOutboundMessageSent);
      window.addEventListener('keydown', this.closePopoverOnEscape, true);
      this.scheduleBehaviourOpen();
      _superPropGet(_default, "connect", this, 3)([]);
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this.cancelBehaviourOpen();
      this.clearPopoverOpenAnimation();
      this.teardownTeaser();
      this.teardownOpeningSequence();
      this.broadcastChannel.removeEventListener('message', this.onOutboundMessageSent);
      this.messagesContainerTarget.removeEventListener('scroll', this.onScroll);
      this.messagesContainerTarget.removeEventListener('wheel', this.stopHostScrollPropagation, SCROLL_ISOLATION_EVENT_OPTIONS);
      this.messagesContainerTarget.removeEventListener('touchmove', this.stopHostScrollPropagation, SCROLL_ISOLATION_EVENT_OPTIONS);
      window.removeEventListener('keydown', this.closePopoverOnEscape, true);

      // Clean up typing indicator timeouts
      this.clearTypingIndicator();
      this.broadcastChannel.close();
      this.floatingUICleanup();
      _superPropGet(_default, "disconnect", this, 3)([]);
    }
  }, {
    key: "setupMessagesContainerScrollIsolation",
    value: function setupMessagesContainerScrollIsolation() {
      this.messagesContainerTarget.style.overscrollBehavior = 'contain';
      this.messagesContainerTarget.style.webkitOverflowScrolling = 'touch';
      this.messagesContainerTarget.style.touchAction = 'pan-y';
      this.messagesContainerTarget.setAttribute('data-lenis-prevent', '');
      this.messagesContainerTarget.setAttribute('data-lenis-prevent-wheel', '');
      this.messagesContainerTarget.setAttribute('data-lenis-prevent-touch', '');
    }
  }, {
    key: "stopHostScrollPropagation",
    value: function stopHostScrollPropagation(event) {
      event.stopPropagation();
    }
  }, {
    key: "onTypingStart",
    value: function onTypingStart() {
      if (this.typingIndicatorVisible) {
        return this.resetTypingIndicatorTimer();
      }
      this.showTypingIndicator();
    }
  }, {
    key: "showOptimisticTypingIndicator",
    value: function showOptimisticTypingIndicator() {
      if (this.typingIndicatorVisible) return;
      this.showTypingIndicator();
    }
  }, {
    key: "showTypingIndicator",
    value: function showTypingIndicator() {
      this.clearTypingIndicator();
      this.typingIndicatorVisible = true;
      const indicator = this.typingIndicatorTemplateTarget.cloneNode(true);
      indicator.setAttribute('data-hellotext--webchat-target', 'typingIndicator');
      indicator.style.display = 'flex';
      this.messagesContainerTarget.appendChild(indicator);
      requestAnimationFrame(() => {
        this.messagesContainerTarget.scroll({
          top: this.messagesContainerTarget.scrollHeight,
          behavior: 'instant'
        });
      });
      const timeout = this.typingIndicatorKeepAliveValue;
      this.incomingTypingIndicatorTimeout = setTimeout(() => {
        this.clearTypingIndicator();
      }, timeout);
    }
  }, {
    key: "resetTypingIndicatorTimer",
    value: function resetTypingIndicatorTimer() {
      if (!this.typingIndicatorVisible) return;

      // Clear existing timeout
      clearTimeout(this.incomingTypingIndicatorTimeout);
      clearTimeout(this.optimisticTypingTimeout);

      // Use unified timeout for all typing indicators
      const timeout = this.typingIndicatorKeepAliveValue;
      this.incomingTypingIndicatorTimeout = setTimeout(() => {
        this.clearTypingIndicator();
      }, timeout);
    }
  }, {
    key: "clearTypingIndicator",
    value: function clearTypingIndicator() {
      if (this.hasTypingIndicatorTarget) {
        this.typingIndicatorTarget.remove();
      }
      this.typingIndicatorVisible = false;
      clearTimeout(this.incomingTypingIndicatorTimeout);
      clearTimeout(this.optimisticTypingTimeout);
    }
  }, {
    key: "onMessageInputChange",
    value: function onMessageInputChange() {
      this.resizeInput();
      clearTimeout(this.typingIndicatorTimeout);
      if (!this.hasSentTypingIndicator) {
        this.webChatChannel.startTypingIndicator();
        this.hasSentTypingIndicator = true;
      }
      this.typingIndicatorTimeout = setTimeout(() => {
        this.hasSentTypingIndicator = false;
      }, 3000);
    }
  }, {
    key: "onOutboundMessageSent",
    value: function onOutboundMessageSent(event) {
      const {
        data
      } = event;
      const callbacks = {
        'message:sent': data => {
          const element = new DOMParser().parseFromString(data.element, 'text/html').body.firstElementChild;
          this.localizeMessageTimestamps(element);

          // Insert message before typing indicator if one exists
          if (this.typingIndicatorVisible && this.hasTypingIndicatorTarget) {
            this.messagesContainerTarget.insertBefore(element, this.typingIndicatorTarget);
          } else {
            this.messagesContainerTarget.appendChild(element);
          }
          element.scrollIntoView({
            behavior: 'instant'
          });
        },
        'message:failed': data => {
          const element = this.messagesContainerTarget.querySelector(`#${data.id}`);
          this.markMessageFailed(element, data.reason);
        }
      };
      if (callbacks[data.type]) {
        callbacks[data.type](data);
      } else {
        console.log(`Unhandled message event: ${data.type}`);
      }
    }
  }, {
    key: "onScroll",
    value: async function onScroll() {
      if (this.messagesContainerTarget.scrollTop > 300 || !this.nextPageValue || this.fetchingNextPage) return;
      this.fetchingNextPage = true;
      const response = await this.messagesAPI.index({
        page: this.nextPageValue,
        session: _hellotext.default.session
      });
      const {
        next: nextPage,
        messages
      } = await response.json();
      this.nextPageValue = nextPage;
      this.oldScrollHeight = this.messagesContainerTarget.scrollHeight;
      messages.forEach(message => {
        const {
          body,
          attachments
        } = message;
        const createdAt = message.created_at || message.createdAt;
        const element = this.messageTemplateTarget.cloneNode(true);
        element.classList.add('hellotext--webchat-message');
        element.setAttribute('data-hellotext--webchat-target', 'message');
        element.setAttribute('data-id', message.id);
        if (createdAt) {
          element.setAttribute('data-created-at', createdAt);
        }
        element.style.removeProperty('display');
        (0, _sanitize_html.setSanitizedRichText)(element.querySelector('[data-body]'), body);
        if (message.state === 'received') {
          element.classList.add('received');
        } else {
          element.classList.remove('received');
        }
        if (attachments) {
          attachments.forEach(attachmentUrl => {
            var _this$messageAttachme;
            const image = this.attachmentImageTarget.cloneNode(true);
            image.removeAttribute('data-hellotext--webchat-target');
            image.src = attachmentUrl;
            image.style.display = 'block';
            (_this$messageAttachme = this.messageAttachmentsContainer(element)) === null || _this$messageAttachme === void 0 || _this$messageAttachme.appendChild(image);
          });
        }
        element.setAttribute('data-body', body);
        this.localizeMessageTimestamp(element.querySelector('[data-message-timestamp]'), createdAt);
        this.messagesContainerTarget.prepend(element);
      });
      this.messagesContainerTarget.scroll({
        top: this.messagesContainerTarget.scrollHeight - this.oldScrollHeight,
        behavior: 'instant'
      });
      this.fetchingNextPage = false;
    }
  }, {
    key: "onClickOutside",
    value: function onClickOutside(event) {
      if (_webchat.Webchat.mode === _webchat.modes.POPOVER && this.openValue && event.target.nodeType && this.element.contains(event.target) === false) {
        this.openValue = false;
      }
    }
  }, {
    key: "closePopover",
    value: function closePopover() {
      this.clearPopoverOpenAnimation();
      this.popoverTarget.classList.remove(...this.fadeOutClasses);
      this.openValue = false;
    }
  }, {
    key: "preparePopoverOpenAnimation",
    value: function preparePopoverOpenAnimation() {
      this.clearPopoverOpenAnimation();
      this.popoverTarget.classList.remove(...this.fadeOutClasses);
      this.popoverTarget.classList.add('hellotext--webchat-popover-opening');
      this.popoverOpenAnimationTimeout = setTimeout(() => {
        this.popoverTarget.classList.remove('hellotext--webchat-popover-opening');
        this.popoverOpenAnimationTimeout = null;
      }, POPOVER_ANIMATION_DURATION);
    }
  }, {
    key: "clearPopoverOpenAnimation",
    value: function clearPopoverOpenAnimation() {
      var _this$popoverTarget;
      if (this.popoverOpenAnimationTimeout) {
        clearTimeout(this.popoverOpenAnimationTimeout);
        this.popoverOpenAnimationTimeout = null;
      }
      (_this$popoverTarget = this.popoverTarget) === null || _this$popoverTarget === void 0 || _this$popoverTarget.classList.remove('hellotext--webchat-popover-opening');
    }
  }, {
    key: "onPopoverOpened",
    value: function onPopoverOpened() {
      var _this$dismissTeaserFo;
      this.popoverTarget.classList.remove(...this.fadeOutClasses);
      (_this$dismissTeaserFo = this.dismissTeaserForSession) === null || _this$dismissTeaserFo === void 0 || _this$dismissTeaserFo.call(this);
      if (!this.onMobile) {
        this.focusComposeInput();
      }
      if (!this.scrolled) {
        requestAnimationFrame(() => {
          this.messagesContainerTarget.scroll({
            top: this.messagesContainerTarget.scrollHeight,
            behavior: 'instant'
          });
        });
        this.scrolled = true;
      }
      _hellotext.default.eventEmitter.dispatch('webchat:opened');
      localStorage.setItem(`hellotext--webchat--${this.idValue}`, 'opened');
      if (this.messageTeaserValue) {
        this.messageTeaserValue = null;
      }
      this.startOpeningSequence();
      if (this.unreadCounterTarget.style.display === 'none') return;
      this.unreadCounterTarget.style.display = 'none';
      this.unreadCounterTarget.innerText = '0';
      this.messagesAPI.markAsSeen();
    }
  }, {
    key: "onPopoverClosed",
    value: function onPopoverClosed() {
      this.clearPopoverOpenAnimation();
      _hellotext.default.eventEmitter.dispatch('webchat:closed');
      localStorage.setItem(`hellotext--webchat--${this.idValue}`, 'closed');
    }
  }, {
    key: "onMessageReaction",
    value: function onMessageReaction(message) {
      const {
        message: messageId,
        reaction,
        type
      } = message;
      const messageElement = this.messageTargets.find(element => element.dataset.id === messageId);
      const reactionsContainer = messageElement.querySelector('[data-reactions]');
      if (type === 'reaction.destroy') {
        const reactionElement = reactionsContainer.querySelector(`[data-id="${reaction.id}"]`);
        return reactionElement.remove();
      }
      if (reactionsContainer.querySelector(`[data-id="${reaction.id}"]`)) {
        const reactionElement = reactionsContainer.querySelector(`[data-id="${reaction.id}"]`);
        reactionElement.innerText = reaction.emoji;
      } else {
        const reactionElement = document.createElement('span');
        reactionElement.innerText = reaction.emoji;
        reactionElement.setAttribute('data-id', reaction.id);
        reactionsContainer.appendChild(reactionElement);
      }
    }
  }, {
    key: "onMessageReceived",
    value: function onMessageReceived(message, options = {}) {
      var _this$hideTeaser;
      const {
        id,
        body,
        attachments,
        teaser
      } = message;
      const createdAt = message.created_at || message.createdAt;
      if (!this.claimMessageId(id)) return;
      (_this$hideTeaser = this.hideTeaser) === null || _this$hideTeaser === void 0 || _this$hideTeaser.call(this);
      if (message.carousel) {
        return this.insertCarouselMessage(message, options);
      }
      const element = this.messageTemplateTarget.cloneNode(true);
      element.classList.add('hellotext--webchat-message');
      element.style.display = 'flex';
      (0, _sanitize_html.setSanitizedRichText)(element.querySelector('[data-body]'), body);
      element.setAttribute('data-id', id);
      element.setAttribute('data-hellotext--webchat-target', 'message');
      this.setMessageCreatedAt(element, createdAt);
      this.localizeMessageTimestamp(element.querySelector('[data-message-timestamp]'), createdAt);
      if (attachments) {
        attachments.forEach(attachmentUrl => {
          var _this$messageAttachme2;
          const image = this.attachmentImageTarget.cloneNode(true);
          image.src = attachmentUrl;
          image.style.display = 'block';
          (_this$messageAttachme2 = this.messageAttachmentsContainer(element)) === null || _this$messageAttachme2 === void 0 || _this$messageAttachme2.appendChild(image);
        });
      }
      this.clearTypingIndicator();
      this.insertMessageElement(element);
      _hellotext.default.eventEmitter.dispatch('webchat:message:received', {
        ...message,
        body: element.querySelector('[data-body]').innerText
      });
      if (options.scroll !== false) {
        element.scrollIntoView({
          behavior: 'smooth'
        });
      }
      this.updateMessageTeaser(teaser);
      if (this.openValue) {
        this.messagesAPI.markAsSeen(id);
        return;
      }
      this.incrementUnreadCounter();
    }

    // TCP broadcasts may deliver the same incoming message twice before Stimulus
    // has connected the appended message target. Claiming the id in memory closes
    // that window, while the target check still drops messages rendered earlier.
  }, {
    key: "claimMessageId",
    value: function claimMessageId(id) {
      const messageTargets = this.messageTargets || [];
      if (this.messageIds.has(id)) return false;
      this.messageIds.add(id);
      return !messageTargets.some(element => element.dataset.id === id);
    }
  }, {
    key: "captureCatchUpCursor",
    value: function captureCatchUpCursor() {
      this.catchUpAfterMessageId = this.lastRenderedMessageId;
    }
  }, {
    key: "catchUpMessages",
    value: async function catchUpMessages() {
      const afterId = this.catchUpAfterMessageId;
      if (!afterId || this.fetchingCatchUpMessages) return;
      this.fetchingCatchUpMessages = true;
      try {
        const response = await this.messagesAPI.catchUp(afterId);
        const {
          messages = []
        } = await response.json();
        messages.forEach(message => this.onMessageReceived(message, {
          scroll: false
        }));
        this.catchUpAfterMessageId = this.lastRenderedMessageId;
      } finally {
        this.fetchingCatchUpMessages = false;
      }
    }
  }, {
    key: "lastRenderedMessageId",
    get: function () {
      var _messages;
      const messages = this.persistedMessageElements;
      return ((_messages = messages[messages.length - 1]) === null || _messages === void 0 ? void 0 : _messages.dataset.id) || null;
    }
  }, {
    key: "persistedMessageElements",
    get: function () {
      return Array.from(this.messagesContainerTarget.querySelectorAll('.hellotext--webchat-message[data-id]'));
    }
  }, {
    key: "setMessageCreatedAt",
    value: function setMessageCreatedAt(element, createdAt) {
      if (createdAt) {
        element.setAttribute('data-created-at', createdAt);
      }
    }
  }, {
    key: "insertMessageElement",
    value: function insertMessageElement(element) {
      const nextElement = this.nextMessageElementFor(element);
      if (nextElement) {
        this.messagesContainerTarget.insertBefore(element, nextElement);
      } else {
        this.messagesContainerTarget.appendChild(element);
      }
    }
  }, {
    key: "nextMessageElementFor",
    value: function nextMessageElementFor(element) {
      const createdAt = Date.parse(element.dataset.createdAt);
      if (Number.isNaN(createdAt)) return null;
      return this.persistedMessageElements.find(messageElement => {
        if (messageElement === element) return false;
        const messageCreatedAt = Date.parse(messageElement.dataset.createdAt);
        return !Number.isNaN(messageCreatedAt) && messageCreatedAt > createdAt;
      });
    }
  }, {
    key: "updateMessageTeaser",
    value: function updateMessageTeaser(teaser) {
      this.messageTeaserValue = teaser;
      if (!this.messageTeaserValue || !this.hasTeaserTarget || !this.hasInboundMessageTeaserTarget || !this.hasInboundMessageTeaserBodyTarget) {
        return;
      }
      this.teaserMessageTargets.forEach(teaserMessage => teaserMessage.classList.add('hidden'));
      this.inboundMessageTeaserBodyTarget.textContent = this.messageTeaserValue;
      this.inboundMessageTeaserTarget.classList.remove('hidden');
      this.teaserTarget.classList.toggle('invisible', this.openValue);
    }
  }, {
    key: "insertCarouselMessage",
    value: function insertCarouselMessage(message, options = {}) {
      var _element$querySelecto;
      const html = message.html;
      const createdAt = message.created_at || message.createdAt;
      const element = (0, _sanitize_html.sanitizedWebchatComponentFragment)(html).firstElementChild;
      element.classList.add('hellotext--webchat-message');
      element.setAttribute('data-id', message.id);
      element.setAttribute('data-hellotext--webchat-target', 'message');
      this.setMessageCreatedAt(element, createdAt);
      this.localizeMessageTimestamps(element);
      this.clearTypingIndicator();
      this.insertMessageElement(element);
      if (options.scroll !== false) {
        element.scrollIntoView({
          behavior: 'smooth'
        });
      }
      _hellotext.default.eventEmitter.dispatch('webchat:message:received', {
        ...message,
        body: ((_element$querySelecto = element.querySelector('[data-body]')) === null || _element$querySelecto === void 0 ? void 0 : _element$querySelecto.innerText) || ''
      });
      this.updateMessageTeaser(message.teaser);
      if (this.openValue) {
        this.messagesAPI.markAsSeen(message.id);
        return;
      }
      this.incrementUnreadCounter();
    }
  }, {
    key: "resizeInput",
    value: function resizeInput() {
      const maxHeight = 96;

      // Temporarily reset height to its natural content size
      this.inputTarget.style.height = 'auto';

      // Set the height to the scrollHeight, which is the minimum height
      // the element needs to fit its content without a scrollbar.
      const scrollHeight = this.inputTarget.scrollHeight;
      this.inputTarget.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, {
    key: "sendQuickReplyMessage",
    value: async function sendQuickReplyMessage({
      detail: {
        id,
        product,
        buttonId,
        body,
        cardElement
      }
    }) {
      var _this$dismissTeaserFo2, _cardElement$querySel;
      (_this$dismissTeaserFo2 = this.dismissTeaserForSession) === null || _this$dismissTeaserFo2 === void 0 || _this$dismissTeaserFo2.call(this);
      const formData = new FormData();
      formData.append('message[body]', body);
      if (id) formData.append('message[replied_to]', id);
      if (product) formData.append('message[product]', product);
      if (buttonId) formData.append('message[button]', buttonId);
      formData.append('session', _hellotext.default.session);
      formData.append('locale', _core.Locale.toString());
      this.appendOpeningSequenceMessageIds(formData);
      const element = this.buildMessageElement();
      const attachment = cardElement === null || cardElement === void 0 || (_cardElement$querySel = cardElement.querySelector('img')) === null || _cardElement$querySel === void 0 ? void 0 : _cardElement$querySel.cloneNode(true);
      element.querySelector('[data-body]').innerText = body;
      if (attachment) {
        var _this$messageAttachme3;
        attachment.removeAttribute('width');
        attachment.removeAttribute('height');
        (_this$messageAttachme3 = this.messageAttachmentsContainer(element)) === null || _this$messageAttachme3 === void 0 || _this$messageAttachme3.appendChild(attachment);
      }
      if (this.typingIndicatorVisible && this.hasTypingIndicatorTarget) {
        this.messagesContainerTarget.insertBefore(element, this.typingIndicatorTarget);
      } else {
        this.messagesContainerTarget.appendChild(element);
      }
      element.scrollIntoView({
        behavior: 'smooth'
      });
      this.broadcastChannel.postMessage({
        type: 'message:sent',
        element: element.outerHTML
      });
      const response = await this.messagesAPI.create(formData);
      if (response.failed) {
        // Clear the optimistic typing indicator on failure
        clearTimeout(this.optimisticTypingTimeout);
        return this.markMessageFailedFromResponse(response, element);
      }
      const data = await response.json();
      this.dispatch('set:id', {
        target: element,
        detail: data.id
      });
      this.localizeMessageTimestamp(element.querySelector('[data-message-timestamp]'), data.created_at || data.createdAt);
      this.clearRevealedOpeningSequenceMessageIds();
      const message = {
        id: data.id,
        body: body,
        attachments: attachment ? [attachment.src] : [],
        replied_to: id,
        product: product,
        button: buttonId,
        type: 'quick_reply'
      };
      _hellotext.default.eventEmitter.dispatch('webchat:message:sent', message);
    }
  }, {
    key: "sendTeaserQuickReply",
    value: async function sendTeaserQuickReply(event) {
      var _this$dismissTeaserFo3;
      event.preventDefault();
      event.stopPropagation();
      const button = event.currentTarget;
      const value = (button.dataset.value || '').trim();
      const label = [button.dataset.text, button.textContent].map(text => (text || '').trim()).find(text => text.length > 0);
      const text = value || label;
      if (!text) return;
      (_this$dismissTeaserFo3 = this.dismissTeaserForSession) === null || _this$dismissTeaserFo3 === void 0 || _this$dismissTeaserFo3.call(this);
      this.show();
      const buttonType = (button.dataset.type || '').trim() || 'quick_reply';
      const formData = new FormData();
      formData.append('message[body]', text);
      formData.append('session', _hellotext.default.session);
      formData.append('locale', _core.Locale.toString());
      this.appendOpeningSequenceMessageIds(formData);
      const element = this.buildMessageElement();
      element.querySelector('[data-body]').innerText = text;
      if (this.typingIndicatorVisible && this.hasTypingIndicatorTarget) {
        this.messagesContainerTarget.insertBefore(element, this.typingIndicatorTarget);
      } else {
        this.messagesContainerTarget.appendChild(element);
      }
      element.scrollIntoView({
        behavior: 'smooth'
      });
      this.broadcastChannel.postMessage({
        type: 'message:sent',
        element: element.outerHTML
      });
      if (!this.typingIndicatorVisible) {
        clearTimeout(this.optimisticTypingTimeout);
        this.optimisticTypingTimeout = setTimeout(() => {
          this.showOptimisticTypingIndicator();
        }, this.optimisticTypingIndicatorWaitValue);
      }
      const response = await this.messagesAPI.create(formData);
      if (response.failed) {
        clearTimeout(this.optimisticTypingTimeout);
        return this.markMessageFailedFromResponse(response, element);
      }
      const data = await response.json();
      element.setAttribute('data-id', data.id);
      this.localizeMessageTimestamp(element.querySelector('[data-message-timestamp]'), data.created_at || data.createdAt);
      this.clearRevealedOpeningSequenceMessageIds();
      _hellotext.default.eventEmitter.dispatch('webchat:message:sent', {
        id: data.id,
        body: text,
        attachments: [],
        type: 'quick_reply',
        teaser: {
          text: label || text,
          value: value || text,
          type: buttonType
        }
      });
      if (data.conversation && data.conversation !== this.conversationIdValue) {
        this.conversationIdValue = data.conversation;
        this.webChatChannel.updateSubscriptionWith(this.conversationIdValue);
      }
      if (this.typingIndicatorVisible) {
        this.resetTypingIndicatorTimer();
      }
    }
  }, {
    key: "sendMessage",
    value: async function sendMessage(e) {
      var _this$dismissTeaserFo4;
      const message = {
        body: this.inputTarget.value,
        attachments: this.files
      };
      if (this.inputTarget.value.trim().length === 0 && this.files.length === 0) {
        if (e && e.target) {
          e.preventDefault();
        }
        return;
      }
      (_this$dismissTeaserFo4 = this.dismissTeaserForSession) === null || _this$dismissTeaserFo4 === void 0 || _this$dismissTeaserFo4.call(this);
      const formData = new FormData();
      if (this.inputTarget.value.trim().length > 0) {
        formData.append('message[body]', this.inputTarget.value);
      } else {
        delete message.body;
      }
      this.files.forEach(file => {
        formData.append('message[attachments][]', file);
      });
      formData.append('session', _hellotext.default.session);
      formData.append('locale', _core.Locale.toString());
      this.appendOpeningSequenceMessageIds(formData);
      const element = this.buildMessageElement();
      if (this.inputTarget.value.trim().length > 0) {
        element.querySelector('[data-body]').innerText = this.inputTarget.value;
      } else {
        element.querySelector('[data-message-bubble]').remove();
      }
      const attachments = this.attachmentContainerTarget.querySelectorAll('img');
      if (attachments.length > 0) {
        attachments.forEach(attachment => {
          var _this$messageAttachme4;
          (_this$messageAttachme4 = this.messageAttachmentsContainer(element)) === null || _this$messageAttachme4 === void 0 || _this$messageAttachme4.appendChild(attachment.cloneNode(true));
        });
      }

      // Insert message before typing indicator if one exists
      if (this.typingIndicatorVisible && this.hasTypingIndicatorTarget) {
        this.messagesContainerTarget.insertBefore(element, this.typingIndicatorTarget);
      } else {
        this.messagesContainerTarget.appendChild(element);
      }
      element.scrollIntoView({
        behavior: 'smooth'
      });
      this.broadcastChannel.postMessage({
        type: 'message:sent',
        element: element.outerHTML
      });
      this.inputTarget.value = '';
      this.resizeInput();
      this.files = [];
      this.attachmentInputTarget.value = '';
      this.attachmentContainerTarget.innerHTML = '';
      this.attachmentContainerTarget.style.display = 'none';
      this.errorMessageContainerTarget.style.display = 'none';
      this.focusComposeInput();

      // Set up optimistic typing indicator BEFORE making the API call
      // This prevents race conditions with server responses
      if (!this.typingIndicatorVisible) {
        clearTimeout(this.optimisticTypingTimeout);
        this.optimisticTypingTimeout = setTimeout(() => {
          this.showOptimisticTypingIndicator();
        }, this.optimisticTypingIndicatorWaitValue);
      }
      const response = await this.messagesAPI.create(formData);
      if (response.failed) {
        // Clear the optimistic typing indicator on failure
        clearTimeout(this.optimisticTypingTimeout);
        return this.markMessageFailedFromResponse(response, element);
      }
      const data = await response.json();
      element.setAttribute('data-id', data.id);
      message.id = data.id;
      this.localizeMessageTimestamp(element.querySelector('[data-message-timestamp]'), data.created_at || data.createdAt);
      this.clearRevealedOpeningSequenceMessageIds();
      _hellotext.default.eventEmitter.dispatch('webchat:message:sent', message);
      if (data.conversation !== this.conversationIdValue) {
        this.conversationIdValue = data.conversation;
        this.webChatChannel.updateSubscriptionWith(this.conversationIdValue);
      }

      // If there's already a typing indicator visible, reset its timer
      if (this.typingIndicatorVisible) {
        this.resetTypingIndicatorTimer();
      }
      this.attachmentContainerTarget.style.display = '';
    }
  }, {
    key: "buildMessageElement",
    value: function buildMessageElement() {
      const element = this.messageTemplateTarget.cloneNode(true);
      element.id = `hellotext--webchat--${this.idValue}--message--${Date.now()}`;
      element.classList.add('received');
      element.style.removeProperty('display');
      element.setAttribute('data-controller', 'hellotext--message');
      element.setAttribute('data-hellotext--webchat-target', 'message');
      this.localizeMessageTimestamp(element.querySelector('[data-message-timestamp]'), new Date());
      return element;
    }
  }, {
    key: "focusCompose",
    value: function focusCompose(event) {
      const {
        target
      } = event;
      const ignoredSelector = ['button', 'a', 'input', 'textarea', 'select', 'label', '[role="button"]', 'em-emoji-picker', '[data-hellotext--webchat--emoji-target~="popover"]', '[data-controller~="hellotext--webchat--emoji"]'].join(', ');
      if (!this.hasInputTarget || target.closest(ignoredSelector)) return;
      if (!this.focusComposeInput({
        moveCursorToEnd: true
      })) return;
      event.preventDefault();
    }
  }, {
    key: "closePopoverFromHeader",
    value: function closePopoverFromHeader(event) {
      const {
        target
      } = event;
      if (target.closest('.hellotext--webchat-header-channel-button, .hellotext--webchat-close-button')) return;
      event.preventDefault();
      this.closePopover();
    }
  }, {
    key: "closePopoverOnEscape",
    value: function closePopoverOnEscape(event) {
      var _this$triggerTarget, _this$triggerTarget$f;
      if (event.key !== 'Escape' || !this.openValue) return;
      event.preventDefault();
      event.stopPropagation();
      this.closePopover();
      (_this$triggerTarget = this.triggerTarget) === null || _this$triggerTarget === void 0 || (_this$triggerTarget$f = _this$triggerTarget.focus) === null || _this$triggerTarget$f === void 0 || _this$triggerTarget$f.call(_this$triggerTarget);
    }
  }, {
    key: "markMessageFailedFromResponse",
    value: async function markMessageFailedFromResponse(response, element) {
      const reason = await this.messageFailureReason(response);
      this.markMessageFailed(element, reason);
      this.broadcastChannel.postMessage({
        type: 'message:failed',
        id: element.id,
        reason
      });
    }
  }, {
    key: "markMessageFailed",
    value: function markMessageFailed(element, reason) {
      if (!element) return;
      element.classList.add('failed');
      if (!reason) return;
      const timestamp = element.querySelector('[data-message-timestamp]');
      if (timestamp) {
        timestamp.textContent = reason;
      }
    }
  }, {
    key: "localizeMessageTimestamps",
    value: function localizeMessageTimestamps(root = this.element) {
      var _root$matches, _root$querySelectorAl;
      if (!root) return;
      const timestamps = (_root$matches = root.matches) !== null && _root$matches !== void 0 && _root$matches.call(root, 'time[datetime][data-message-timestamp]') ? [root] : Array.from(((_root$querySelectorAl = root.querySelectorAll) === null || _root$querySelectorAl === void 0 ? void 0 : _root$querySelectorAl.call(root, 'time[datetime][data-message-timestamp]')) || []);
      timestamps.forEach(timestamp => this.localizeMessageTimestamp(timestamp));
    }
  }, {
    key: "localizeMessageTimestamp",
    value: function localizeMessageTimestamp(timestamp, value = timestamp === null || timestamp === void 0 ? void 0 : timestamp.getAttribute('datetime')) {
      if (!timestamp || !value) return;
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return;
      timestamp.setAttribute('datetime', date.toISOString());
      timestamp.textContent = this.formatMessageTimestamp(date);
    }
  }, {
    key: "formatMessageTimestamp",
    value: function formatMessageTimestamp(date) {
      return this.constructor.messageTimestampFormatterFor(_core.Locale.toString()).format(date);
    }
  }, {
    key: "messageFailureReason",
    value: async function messageFailureReason(response) {
      const nativeResponse = (response === null || response === void 0 ? void 0 : response.data) || (response === null || response === void 0 ? void 0 : response.response);
      const fallback = (nativeResponse === null || nativeResponse === void 0 ? void 0 : nativeResponse.statusText) || 'Message failed';
      try {
        var _jsonResponse$json;
        const jsonResponse = nativeResponse !== null && nativeResponse !== void 0 && nativeResponse.clone ? nativeResponse.clone() : nativeResponse;
        const payload = await (jsonResponse === null || jsonResponse === void 0 || (_jsonResponse$json = jsonResponse.json) === null || _jsonResponse$json === void 0 ? void 0 : _jsonResponse$json.call(jsonResponse));
        const reason = this.messageFailureReasonFromPayload(payload);
        if (reason) return reason;
      } catch (_) {
        // Fall through to text parsing/fallback. Some stores strip content-type or
        // return non-JSON failures, so the timestamp still needs a useful reason.
      }
      try {
        var _textResponse$text;
        const textResponse = nativeResponse !== null && nativeResponse !== void 0 && nativeResponse.clone ? nativeResponse.clone() : nativeResponse;
        const text = await (textResponse === null || textResponse === void 0 || (_textResponse$text = textResponse.text) === null || _textResponse$text === void 0 ? void 0 : _textResponse$text.call(textResponse));
        return this.messageFailureReasonFromText(text) || fallback;
      } catch (_) {
        return fallback;
      }
    }
  }, {
    key: "messageFailureReasonFromText",
    value: function messageFailureReasonFromText(text) {
      if (typeof text !== 'string') return null;
      const value = text.trim();
      if (!value || value.startsWith('<')) return null;
      try {
        return this.messageFailureReasonFromPayload(JSON.parse(value)) || value;
      } catch (_) {
        return value;
      }
    }
  }, {
    key: "messageFailureReasonFromPayload",
    value: function messageFailureReasonFromPayload(payload) {
      var _payload$error, _payload$errors, _payload$errors2, _payload$errors3;
      if (!payload) return null;
      return [(_payload$error = payload.error) === null || _payload$error === void 0 ? void 0 : _payload$error.message, payload.message, (_payload$errors = payload.errors) === null || _payload$errors === void 0 ? void 0 : _payload$errors.message, (_payload$errors2 = payload.errors) === null || _payload$errors2 === void 0 || (_payload$errors2 = _payload$errors2[0]) === null || _payload$errors2 === void 0 ? void 0 : _payload$errors2.message, (_payload$errors3 = payload.errors) === null || _payload$errors3 === void 0 || (_payload$errors3 = _payload$errors3[0]) === null || _payload$errors3 === void 0 ? void 0 : _payload$errors3.description].find(reason => typeof reason === 'string' && reason.trim().length > 0);
    }
  }, {
    key: "messageAttachmentsContainer",
    value: function messageAttachmentsContainer(element) {
      return element.querySelector('[data-attachments-container], [data-attachment-container]');
    }
  }, {
    key: "incrementUnreadCounter",
    value: function incrementUnreadCounter() {
      this.unreadCounterTarget.style.display = 'flex';
      const unreadCount = (parseInt(this.unreadCounterTarget.innerText) || 0) + 1;
      this.unreadCounterTarget.innerText = Math.min(unreadCount, 9);
    }
  }, {
    key: "openAttachment",
    value: function openAttachment() {
      this.attachmentInputTarget.click();
    }
  }, {
    key: "onFileInputChange",
    value: function onFileInputChange() {
      this.errorMessageContainerTarget.style.display = 'none';
      const newFiles = Array.from(this.attachmentInputTarget.files);
      this.attachmentInputTarget.value = '';
      const fileMaxSizeTooMuch = newFiles.find(file => {
        const type = file.type.split('/')[0];
        if (['image', 'video', 'audio'].includes(type)) {
          return this.mediaValue[type].max_size < file.size;
        } else {
          return this.mediaValue.document.max_size < file.size;
        }
      });
      if (fileMaxSizeTooMuch) {
        const type = fileMaxSizeTooMuch.type.split('/')[0];
        const mediaType = ['image', 'audio', 'video'].includes(type) ? type : 'document';
        this.errorMessageContainerTarget.innerText = this.fileSizeErrorMessageValue.replace('%{limit}', this.byteToMegabyte(this.mediaValue[mediaType].max_size));
        return this.errorMessageContainerTarget.style.display = 'block';
      }
      this.files = [...this.files, ...newFiles];
      this.errorMessageContainerTarget.innerText = '';
      newFiles.forEach(file => this.createAttachmentElement(file));
      this.focusComposeInput();
    }
  }, {
    key: "createAttachmentElement",
    value: function createAttachmentElement(file) {
      const element = this.attachmentElement();
      this.attachmentContainerTarget.style.display = '';
      element.setAttribute('data-name', file.name);
      if (file.type.startsWith('image/')) {
        const thumbnail = this.attachmentImageTarget.cloneNode(true);
        thumbnail.src = URL.createObjectURL(file);
        thumbnail.style.display = 'block';
        element.appendChild(thumbnail);
        this.attachmentContainerTarget.appendChild(element);
        this.attachmentContainerTarget.style.display = 'flex';
      } else {
        const main = element.querySelector('main');
        main.style.height = '5rem';
        main.style.borderRadius = '0.375rem';
        main.style.backgroundColor = '#e5e7eb';
        main.style.padding = '0.25rem';
        element.querySelector('p[data-attachment-name]').innerText = file.name;
        this.attachmentContainerTarget.appendChild(element);
        this.attachmentContainerTarget.style.display = 'flex';
      }
    }
  }, {
    key: "removeAttachment",
    value: function removeAttachment({
      currentTarget
    }) {
      const attachment = currentTarget.closest("[data-hellotext--webchat-target='attachment']");
      this.files = this.files.filter(file => file.name !== attachment.dataset.name);
      this.attachmentInputTarget.value = '';
      attachment.remove();
      this.focusComposeInput();
    }
  }, {
    key: "attachmentTargetDisconnected",
    value: function attachmentTargetDisconnected() {
      if (this.attachmentTargets.length === 0) {
        this.attachmentContainerTarget.innerHTML = '';
        this.attachmentContainerTarget.style.display = 'none';
      }
    }
  }, {
    key: "attachmentElement",
    value: function attachmentElement() {
      const element = this.attachmentTemplateTarget.cloneNode(true);
      element.removeAttribute('hidden');
      element.style.display = 'flex';
      element.setAttribute('data-hellotext--webchat-target', 'attachment');
      return element;
    }
  }, {
    key: "onEmojiSelect",
    value: function onEmojiSelect({
      detail: emoji
    }) {
      const value = this.inputTarget.value;
      const start = this.inputTarget.selectionStart;
      const end = this.inputTarget.selectionEnd;
      this.inputTarget.value = value.slice(0, start) + emoji + value.slice(end);
      this.inputTarget.selectionStart = this.inputTarget.selectionEnd = start + emoji.length;
      this.focusComposeInput();
    }
  }, {
    key: "focusComposeInput",
    value: function focusComposeInput({
      moveCursorToEnd = false
    } = {}) {
      if (!this.shouldAutofocusCompose) return false;
      if (this.hasInputTarget === false) return false;
      if (this.hasInputTarget === undefined && !this.inputTarget) return false;
      this.inputTarget.focus();
      if (moveCursorToEnd && typeof this.inputTarget.selectionStart === 'number') {
        const position = this.inputTarget.value.length;
        this.inputTarget.setSelectionRange(position, position);
      }
      return true;
    }
  }, {
    key: "byteToMegabyte",
    value: function byteToMegabyte(bytes) {
      return Math.ceil(bytes / 1024 / 1024);
    }
  }, {
    key: "middlewares",
    get: function () {
      return [(0, _dom.offset)(this.offsetValue), (0, _dom.shift)({
        padding: this.paddingValue
      }), (0, _dom.flip)()];
    }
  }, {
    key: "shouldOpenOnMount",
    get: function () {
      return localStorage.getItem(`hellotext--webchat--${this.idValue}`) === 'opened' && !this.onMobile;
    }
  }, {
    key: "shouldAutofocusCompose",
    get: function () {
      return !this.usesVirtualKeyboard;
    }
  }, {
    key: "usesVirtualKeyboard",
    get: function () {
      var _navigator$userAgentD;
      if (typeof navigator === 'undefined') return false;
      const userAgent = navigator.userAgent || '';
      const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
      const isMobileUserAgent = MOBILE_USER_AGENT_PATTERN.test(userAgent);
      const isUserAgentDataMobile = ((_navigator$userAgentD = navigator.userAgentData) === null || _navigator$userAgentD === void 0 ? void 0 : _navigator$userAgentD.mobile) === true;
      return isMobileUserAgent || isIPadOS || isUserAgentDataMobile || this.hasTouchOnlyPointer;
    }
  }, {
    key: "hasTouchOnlyPointer",
    get: function () {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
      return window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(hover: none)').matches;
    }
  }, {
    key: "onMobile",
    get: function () {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
      return window.matchMedia(`(max-width: ${this.fullScreenThresholdValue}px)`).matches;
    }
  }], [{
    key: "messageTimestampFormatterFor",
    value: function messageTimestampFormatterFor(locale) {
      const key = locale || 'default';
      if (!this.messageTimestampFormatters[key]) {
        this.messageTimestampFormatters[key] = this.buildMessageTimestampFormatter(locale);
      }
      return this.messageTimestampFormatters[key];
    }
  }, {
    key: "buildMessageTimestampFormatter",
    value: function buildMessageTimestampFormatter(locale) {
      try {
        return new Intl.DateTimeFormat(locale || undefined, MESSAGE_TIMESTAMP_FORMAT_OPTIONS);
      } catch (_) {
        return new Intl.DateTimeFormat(undefined, MESSAGE_TIMESTAMP_FORMAT_OPTIONS);
      }
    }
  }]);
}(_stimulus.Controller);
_default.messageTimestampFormatters = {};
_default.values = {
  id: String,
  conversationId: String,
  media: Object,
  fileSizeErrorMessage: String,
  placement: {
    type: String,
    default: 'bottom-end'
  },
  open: {
    type: Boolean,
    default: false
  },
  autoPlacement: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  nextPage: {
    type: Number,
    default: undefined
  },
  fullScreenThreshold: {
    type: Number,
    default: 1024
  },
  typingIndicatorKeepAlive: {
    type: Number,
    default: 30000
  },
  // 30 seconds
  offset: {
    type: Number,
    default: 24
  },
  padding: {
    type: Number,
    default: 24
  },
  optimisticTypingIndicatorWait: {
    type: Number,
    default: 1000
  },
  // 1 second,
  teaser: Object,
  messageTeaser: String,
  behaviour: Object
};
_default.classes = ['fadeOut'];
_default.targets = ['trigger', 'popover', 'input', 'attachmentInput', 'attachmentButton', 'errorMessageContainer', 'attachmentTemplate', 'attachmentContainer', 'attachment', 'messageTemplate', 'messagesContainer', 'title', 'attachmentImage', 'footer', 'toolbar', 'message', 'unreadCounter', 'typingIndicator', 'typingIndicatorTemplate', 'teaser', 'teaserMessage', 'inboundMessageTeaser', 'inboundMessageTeaserBody', 'openingSequence', 'openingSequenceMessage'];