"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dom = require("@floating-ui/dom");
var _stimulus = require("@hotwired/stimulus");
var _messages = _interopRequireDefault(require("../api/webchat/messages"));
var _webchat_channel = _interopRequireDefault(require("../channels/webchat_channel"));
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _core = require("../core");
var _webchat = require("../core/configuration/webchat");
var _logo_builder = require("../builders/logo_builder");
var _usePopover = require("./mixins/usePopover");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
let _default = /*#__PURE__*/function (_Controller) {
  _inherits(_default, _Controller);
  var _super = _createSuper(_default);
  function _default() {
    _classCallCheck(this, _default);
    return _super.apply(this, arguments);
  }
  _createClass(_default, [{
    key: "initialize",
    value: function initialize() {
      this.messagesAPI = new _messages.default(this.idValue);
      this.webChatChannel = new _webchat_channel.default(this.idValue, _hellotext.default.session, this.conversationIdValue);
      this.files = [];
      this.onMessageReceived = this.onMessageReceived.bind(this);
      this.onConversationAssignment = this.onConversationAssignment.bind(this);
      this.onAgentOnline = this.onAgentOnline.bind(this);
      this.onMessageReaction = this.onMessageReaction.bind(this);
      this.onTypingStart = this.onTypingStart.bind(this);
      this.onScroll = this.onScroll.bind(this);
      this.onOutboundMessageSent = this.onOutboundMessageSent.bind(this);
      this.broadcastChannel = new BroadcastChannel(`hellotext--webchat--${this.idValue}`);
      _get(_getPrototypeOf(_default.prototype), "initialize", this).call(this);
    }
  }, {
    key: "connect",
    value: function connect() {
      (0, _usePopover.usePopover)(this);
      this.popoverTarget.classList.add(..._webchat.Webchat.classes);
      this.triggerTarget.classList.add(..._webchat.Webchat.triggerClasses);
      this.setupFloatingUI({
        trigger: this.triggerTarget,
        popover: this.popoverTarget
      });
      this.webChatChannel.onMessage(this.onMessageReceived);
      this.webChatChannel.onConversationAssignment(this.onConversationAssignment);
      this.webChatChannel.onTypingStart(this.onTypingStart);
      this.webChatChannel.onAgentOnline(this.onAgentOnline);
      this.webChatChannel.onReaction(this.onMessageReaction);
      this.messagesContainerTarget.addEventListener('scroll', this.onScroll);
      if (!_hellotext.default.business.features.white_label) {
        this.toolbarTarget.appendChild(_logo_builder.LogoBuilder.build());
      }
      if (this.shouldOpenOnMount) {
        this.openValue = true;
      }
      _hellotext.default.eventEmitter.dispatch('webchat:mounted');
      this.broadcastChannel.addEventListener('message', this.onOutboundMessageSent);
      _get(_getPrototypeOf(_default.prototype), "connect", this).call(this);
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this.broadcastChannel.removeEventListener('message', this.onOutboundMessageSent);
      this.messagesContainerTarget.removeEventListener('scroll', this.onScroll);
      this.broadcastChannel.close();
      this.floatingUICleanup();
      _get(_getPrototypeOf(_default.prototype), "disconnect", this).call(this);
    }
  }, {
    key: "onTypingStart",
    value: function onTypingStart() {
      if (this.typingIndicatorVisible) return;
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
      this.incomingTypingIndicatorTimeout = setTimeout(() => {
        indicator.remove();
        this.typingIndicatorVisible = false;
      }, this.typingIndicatorKeepAliveValue);
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
    key: "onMessageInputKeydown",
    value: function onMessageInputKeydown(event) {
      const hasContent = event.target.value.trim() !== '';
      if ((event.key === ' ' || event.key === 'Enter' && event.shiftKey) && !hasContent) {
        event.preventDefault();
        return;
      }
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
          this.messagesContainerTarget.appendChild(element);
          element.scrollIntoView({
            behavior: 'instant'
          });
        },
        'message:failed': data => {
          var _this$messagesContain;
          (_this$messagesContain = this.messagesContainerTarget.querySelector(`#${data.id}`)) === null || _this$messagesContain === void 0 ? void 0 : _this$messagesContain.classList.add('failed');
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
        const div = document.createElement('div');
        div.innerHTML = body;
        const element = this.messageTemplateTarget.cloneNode(true);
        element.setAttribute('data-hellotext--webchat-target', 'message');
        element.style.removeProperty('display');
        element.querySelector('[data-body]').innerHTML = div.innerHTML;
        if (message.state === 'received') {
          element.classList.add('received');
        } else {
          element.classList.remove('received');
        }
        if (attachments) {
          attachments.forEach(attachmentUrl => {
            const image = this.attachmentImageTarget.cloneNode(true);
            image.removeAttribute('data-hellotext--webchat-target');
            image.src = attachmentUrl;
            image.style.display = 'block';
            element.querySelector('[data-attachment-container]').appendChild(image);
          });
        }
        element.setAttribute('data-body', body);
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
      if (_webchat.Webchat.behaviour === _webchat.behaviors.POPOVER && this.openValue && event.target.nodeType && this.element.contains(event.target) === false) {
        this.openValue = false;
      }
    }
  }, {
    key: "closePopover",
    value: function closePopover() {
      this.popoverTarget.classList.add(...this.fadeOutClasses);
      setTimeout(() => {
        this.openValue = false;
      }, 250);
    }
  }, {
    key: "onPopoverOpened",
    value: function onPopoverOpened() {
      if (!this.onMobile) {
        this.inputTarget.focus();
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
      if (this.unreadCounterTarget.style.display === 'none') return;
      this.unreadCounterTarget.style.display = 'none';
      this.unreadCounterTarget.innerText = '0';
      this.messagesAPI.markAsSeen();
    }
  }, {
    key: "onPopoverClosed",
    value: function onPopoverClosed() {
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
    value: function onMessageReceived(message) {
      const {
        id,
        body,
        attachments
      } = message;
      const div = document.createElement('div');
      div.innerHTML = body;
      const element = this.messageTemplateTarget.cloneNode(true);
      element.style.display = 'flex';
      element.querySelector('[data-body]').innerHTML = div.innerHTML;
      element.setAttribute('data-hellotext--webchat-target', 'message');
      if (attachments) {
        attachments.forEach(attachmentUrl => {
          const image = this.attachmentImageTarget.cloneNode(true);
          image.src = attachmentUrl;
          image.style.display = 'block';
          element.querySelector('[data-attachment-container]').appendChild(image);
        });
      }
      if (this.typingIndicatorVisible) {
        if (this.typingIndicatorTarget) {
          this.typingIndicatorTarget.remove();
        }
        this.typingIndicatorVisible = false;
        clearTimeout(this.incomingTypingIndicatorTimeout);
      }
      this.messagesContainerTarget.appendChild(element);
      _hellotext.default.eventEmitter.dispatch('webchat:message:received', {
        ...message,
        body: element.querySelector('[data-body]').innerText
      });
      element.scrollIntoView({
        behavior: 'smooth'
      });
      this.setOfflineTimeout();
      if (this.openValue) {
        this.messagesAPI.markAsSeen(id);
        return;
      }
      this.unreadCounterTarget.style.display = 'flex';
      const unreadCount = (parseInt(this.unreadCounterTarget.innerText) || 0) + 1;
      this.unreadCounterTarget.innerText = unreadCount > 99 ? '99+' : unreadCount;
    }
  }, {
    key: "onConversationAssignment",
    value: function onConversationAssignment(conversation) {
      const {
        to: user
      } = conversation;
      this.titleTarget.innerText = user.name;
      if (user.online) {
        this.onlineStatusTarget.style.display = 'flex';
      } else {
        this.onlineStatusTarget.style.display = 'none';
      }
    }
  }, {
    key: "onAgentOnline",
    value: function onAgentOnline() {
      this.onlineStatusTarget.style.display = 'flex';
      this.setOfflineTimeout();
    }
  }, {
    key: "resizeInput",
    value: function resizeInput() {
      const input = this.inputTarget;
      const maxHeight = 96; // 96px

      // Temporarily reset height to its natural content size
      input.style.height = 'auto';

      // Set the height to the scrollHeight, which is the minimum height
      // the element needs to fit its content without a scrollbar.
      const scrollHeight = Math.min(input.scrollHeight, 20);
      console.log(scrollHeight, maxHeight);
      // Apply the new height, capped by the max height
      input.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, {
    key: "sendMessage",
    value: async function sendMessage(e) {
      const formData = new FormData();
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
      const element = this.messageTemplateTarget.cloneNode(true);
      element.id = `hellotext--webchat--${this.idValue}--message--${Date.now()}`;
      element.classList.add('received');
      element.style.removeProperty('display');
      element.setAttribute('data-hellotext--webchat-target', 'message');
      if (this.inputTarget.value.trim().length > 0) {
        element.querySelector('[data-body]').innerText = this.inputTarget.value;
      } else {
        element.querySelector('[data-message-bubble]').remove();
      }
      const attachments = this.attachmentContainerTarget.querySelectorAll('img');
      if (attachments.length > 0) {
        attachments.forEach(attachment => {
          element.querySelector('[data-attachment-container]').appendChild(attachment);
        });
      }
      this.messagesContainerTarget.appendChild(element);
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
      this.inputTarget.focus();
      const response = await this.messagesAPI.create(formData);
      if (response.failed) {
        this.broadcastChannel.postMessage({
          type: 'message:failed',
          id: element.id
        });
        return element.classList.add('failed');
      }
      const data = await response.json();
      element.setAttribute('data-id', data.id);
      message.id = data.id;
      _hellotext.default.eventEmitter.dispatch('webchat:message:sent', message);
      if (data.conversation !== this.conversationIdValue) {
        this.conversationIdValue = data.conversation;
        this.webChatChannel.updateSubscriptionWith(this.conversationIdValue);
      }
      this.attachmentContainerTarget.style.display = '';
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
      this.inputTarget.focus();
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
      this.inputTarget.focus();
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
      this.inputTarget.focus();
    }
  }, {
    key: "setOfflineTimeout",
    value: function setOfflineTimeout() {
      clearTimeout(this.offlineTimeout);
      this.offlineTimeout = setTimeout(() => {
        this.onlineStatusTarget.style.display = 'none';
      }, this.fiveMinutes);
    }
  }, {
    key: "byteToMegabyte",
    value: function byteToMegabyte(bytes) {
      return Math.ceil(bytes / 1024 / 1024);
    }
  }, {
    key: "fiveMinutes",
    get: function () {
      return 300000;
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
    key: "onMobile",
    get: function () {
      return window.matchMedia(`(max-width: ${this.fullScreenThresholdValue}px)`).matches;
    }
  }]);
  return _default;
}(_stimulus.Controller);
exports.default = _default;
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
    default: 25000
  },
  offset: {
    type: Number,
    default: 24
  },
  padding: {
    type: Number,
    default: 24
  }
};
_default.classes = ['fadeOut'];
_default.targets = ['trigger', 'popover', 'input', 'attachmentInput', 'attachmentButton', 'errorMessageContainer', 'attachmentTemplate', 'attachmentContainer', 'attachment', 'messageTemplate', 'messagesContainer', 'title', 'onlineStatus', 'attachmentImage', 'footer', 'toolbar', 'message', 'unreadCounter', 'typingIndicator', 'typingIndicatorTemplate'];