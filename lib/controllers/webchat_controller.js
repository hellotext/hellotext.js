function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
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
import { flip, offset, shift } from '@floating-ui/dom';
import { Controller } from '@hotwired/stimulus';
import WebchatMessagesAPI from '../api/webchat/messages';
import WebchatChannel from '../channels/webchat_channel';
import Hellotext from '../hellotext';
import { Webchat as WebchatConfiguration, behaviors } from '../core/configuration/webchat';
import { LogoBuilder } from '../builders/logo_builder';
import { usePopover } from './mixins/usePopover';
var _default = /*#__PURE__*/function (_Controller) {
  _inherits(_default, _Controller);
  var _super = _createSuper(_default);
  function _default() {
    _classCallCheck(this, _default);
    return _super.apply(this, arguments);
  }
  _createClass(_default, [{
    key: "initialize",
    value: function initialize() {
      this.messagesAPI = new WebchatMessagesAPI(this.idValue);
      this.webChatChannel = new WebchatChannel(this.idValue, Hellotext.session, this.conversationIdValue);
      this.files = [];
      this.onMessageReceived = this.onMessageReceived.bind(this);
      this.onConversationAssignment = this.onConversationAssignment.bind(this);
      this.onAgentOnline = this.onAgentOnline.bind(this);
      this.onMessageReaction = this.onMessageReaction.bind(this);
      this.onScroll = this.onScroll.bind(this);
      this.onOutboundMessageSent = this.onOutboundMessageSent.bind(this);
      this.broadcastChannel = new BroadcastChannel("hellotext--webchat--".concat(this.idValue));
      _get(_getPrototypeOf(_default.prototype), "initialize", this).call(this);
    }
  }, {
    key: "connect",
    value: function connect() {
      usePopover(this);
      this.popoverTarget.classList.add(...WebchatConfiguration.classes);
      this.triggerTarget.classList.add(...WebchatConfiguration.triggerClasses);
      this.setupFloatingUI({
        trigger: this.triggerTarget,
        popover: this.popoverTarget
      });
      this.webChatChannel.onMessage(this.onMessageReceived);
      this.webChatChannel.onConversationAssignment(this.onConversationAssignment);
      this.webChatChannel.onAgentOnline(this.onAgentOnline);
      this.webChatChannel.onReaction(this.onMessageReaction);
      this.messagesContainerTarget.addEventListener('scroll', this.onScroll);
      if (!Hellotext.business.features.white_label) {
        this.toolbarTarget.appendChild(LogoBuilder.build());
      }
      if (localStorage.getItem("hellotext--webchat--".concat(this.idValue)) === 'opened') {
        this.openValue = true;
      }
      Hellotext.eventEmitter.dispatch('webchat:mounted');
      this.broadcastChannel.addEventListener('message', this.onOutboundMessageSent);
      _get(_getPrototypeOf(_default.prototype), "connect", this).call(this);
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this.messagesContainerTarget.removeEventListener('scroll', this.onScroll);
      this.floatingUICleanup();
      _get(_getPrototypeOf(_default.prototype), "disconnect", this).call(this);
    }
  }, {
    key: "onOutboundMessageSent",
    value: function onOutboundMessageSent(event) {
      console.log(event);
    }
  }, {
    key: "onScroll",
    value: function () {
      var _onScroll = _asyncToGenerator(function* () {
        if (this.messagesContainerTarget.scrollTop > 300 || !this.nextPageValue || this.fetchingNextPage) return;
        this.fetchingNextPage = true;
        var response = yield this.messagesAPI.index({
          page: this.nextPageValue,
          session: Hellotext.session
        });
        var {
          next: nextPage,
          messages
        } = yield response.json();
        this.nextPageValue = nextPage;
        this.oldScrollHeight = this.messagesContainerTarget.scrollHeight;
        messages.forEach(message => {
          var {
            body,
            attachments
          } = message;
          var div = document.createElement('div');
          div.innerHTML = body;
          var element = this.messageTemplateTarget.cloneNode(true);
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
              var image = this.attachmentImageTarget.cloneNode(true);
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
      });
      function onScroll() {
        return _onScroll.apply(this, arguments);
      }
      return onScroll;
    }()
  }, {
    key: "onClickOutside",
    value: function onClickOutside(event) {
      if (WebchatConfiguration.behaviour === behaviors.POPOVER && this.openValue && event.target.nodeType && this.element.contains(event.target) === false) {
        this.openValue = false;
      }
    }
  }, {
    key: "onPopoverOpened",
    value: function onPopoverOpened() {
      this.inputTarget.focus();
      if (!this.scrolled) {
        this.messagesContainerTarget.scroll({
          top: this.messagesContainerTarget.scrollHeight,
          behavior: 'instant'
        });
        this.scrolled = true;
      }
      Hellotext.eventEmitter.dispatch('webchat:opened');
      localStorage.setItem("hellotext--webchat--".concat(this.idValue), 'opened');
      if (this.unreadCounterTarget.style.display === 'none') return;
      this.unreadCounterTarget.style.display = 'none';
      this.unreadCounterTarget.innerText = '0';
      this.messagesAPI.markAsSeen();
    }
  }, {
    key: "onPopoverClosed",
    value: function onPopoverClosed() {
      Hellotext.eventEmitter.dispatch('webchat:closed');
      setTimeout(() => {
        this.inputTarget.value = '';
      });
      localStorage.setItem("hellotext--webchat--".concat(this.idValue), 'closed');
    }
  }, {
    key: "onMessageReaction",
    value: function onMessageReaction(message) {
      var {
        message: messageId,
        reaction,
        type
      } = message;
      var messageElement = this.messageTargets.find(element => element.dataset.id === messageId);
      var reactionsContainer = messageElement.querySelector('[data-reactions]');
      if (type === 'reaction.destroy') {
        var reactionElement = reactionsContainer.querySelector("[data-id=\"".concat(reaction.id, "\"]"));
        return reactionElement.remove();
      }
      if (reactionsContainer.querySelector("[data-id=\"".concat(reaction.id, "\"]"))) {
        var _reactionElement = reactionsContainer.querySelector("[data-id=\"".concat(reaction.id, "\"]"));
        _reactionElement.innerText = reaction.emoji;
      } else {
        var _reactionElement2 = document.createElement('span');
        _reactionElement2.innerText = reaction.emoji;
        _reactionElement2.setAttribute('data-id', reaction.id);
        reactionsContainer.appendChild(_reactionElement2);
      }
    }
  }, {
    key: "onMessageReceived",
    value: function onMessageReceived(message) {
      var {
        body,
        attachments
      } = message;
      var div = document.createElement('div');
      div.innerHTML = body;
      var element = this.messageTemplateTarget.cloneNode(true);
      element.style.display = 'flex';
      element.querySelector('[data-body]').innerHTML = div.innerHTML;
      element.setAttribute('data-hellotext--webchat-target', 'message');
      if (attachments) {
        attachments.forEach(attachmentUrl => {
          var image = this.attachmentImageTarget.cloneNode(true);
          image.src = attachmentUrl;
          image.style.display = 'block';
          element.querySelector('[data-attachment-container]').appendChild(image);
        });
      }
      this.messagesContainerTarget.appendChild(element);
      Hellotext.eventEmitter.dispatch('webchat:message:received', _objectSpread(_objectSpread({}, message), {}, {
        body: element.querySelector('[data-body]').innerText
      }));
      element.scrollIntoView({
        behavior: 'smooth'
      });
      this.setOfflineTimeout();
      if (this.openValue) return;
      this.unreadCounterTarget.style.display = 'flex';
      var unreadCount = (parseInt(this.unreadCounterTarget.innerText) || 0) + 1;
      this.unreadCounterTarget.innerText = unreadCount > 99 ? '99+' : unreadCount;
    }
  }, {
    key: "onConversationAssignment",
    value: function onConversationAssignment(conversation) {
      var {
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
    key: "sendMessage",
    value: function () {
      var _sendMessage = _asyncToGenerator(function* () {
        var formData = new FormData();
        var message = {
          body: this.inputTarget.value,
          attachments: this.files
        };
        formData.append('message[body]', this.inputTarget.value);
        this.files.forEach(file => {
          formData.append('message[attachments][]', file);
        });
        formData.append('session', Hellotext.session);
        var element = this.messageTemplateTarget.cloneNode(true);
        element.classList.add('received');
        element.style.removeProperty('display');
        element.setAttribute('data-hellotext--webchat-target', 'message');
        element.querySelector('[data-body]').innerText = this.inputTarget.value;
        var attachments = this.attachmentContainerTarget.querySelectorAll('img');
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
          type: 'outbound-message',
          element: element.outerHTML
        });
        this.inputTarget.value = '';
        this.files = [];
        this.attachmentContainerTarget.style.display = 'none';
        this.errorMessageContainerTarget.style.display = 'none';
        this.inputTarget.focus();
        var response = yield this.messagesAPI.create(formData);
        if (response.failed) {
          return element.classList.add('failed');
        }
        var data = yield response.json();
        element.setAttribute('data-id', data.id);
        message.id = data.id;
        Hellotext.eventEmitter.dispatch('webchat:message:sent', message);
        if (data.conversation !== this.conversationIdValue) {
          this.conversationIdValue = data.conversation;
          this.webChatChannel.updateSubscriptionWith(this.conversationIdValue);
        }
        this.attachmentContainerTarget.style.display = '';
      });
      function sendMessage() {
        return _sendMessage.apply(this, arguments);
      }
      return sendMessage;
    }()
  }, {
    key: "openAttachment",
    value: function openAttachment() {
      this.attachmentInputTarget.click();
    }
  }, {
    key: "onFileInputChange",
    value: function onFileInputChange() {
      this.errorMessageContainerTarget.style.display = 'none';
      this.files = Array.from(this.attachmentInputTarget.files);
      var fileMaxSizeTooMuch = this.files.find(file => {
        var type = file.type.split('/')[0];
        if (['image', 'video', 'audio'].includes(type)) {
          return this.mediaValue[type].max_size < file.size;
        } else {
          return this.mediaValue.document.max_size < file.size;
        }
      });
      if (fileMaxSizeTooMuch) {
        var type = fileMaxSizeTooMuch.type.split('/')[0];
        var mediaType = ['image', 'audio', 'video'].includes(type) ? type : 'document';
        this.errorMessageContainerTarget.innerText = this.fileSizeErrorMessageValue.replace('%{limit}', this.byteToMegabyte(this.mediaValue[mediaType].max_size));
        return;
      }
      this.errorMessageContainerTarget.innerText = '';
      this.files.forEach(file => this.createAttachmentElement(file));
      this.inputTarget.focus();
    }
  }, {
    key: "createAttachmentElement",
    value: function createAttachmentElement(file) {
      var element = this.attachmentElement();
      this.attachmentContainerTarget.style.display = '';
      element.setAttribute('data-name', file.name);
      if (file.type.startsWith('image/')) {
        var thumbnail = this.attachmentImageTarget.cloneNode(true);
        thumbnail.src = URL.createObjectURL(file);
        thumbnail.style.display = 'block';
        element.appendChild(thumbnail);
        this.attachmentContainerTarget.appendChild(element);
        this.attachmentContainerTarget.style.display = 'flex';
      } else {
        var main = element.querySelector('main');
        main.style.height = '5rem';
        main.style.borderRadius = '0.375rem';
        main.style.backgroundColor = '#e5e7eb';
        main.style.padding = '0.25rem';
        element.querySelector('p[data-attachment-name]').innerText = file.name;
      }
    }
  }, {
    key: "removeAttachment",
    value: function removeAttachment(_ref) {
      var {
        currentTarget
      } = _ref;
      var attachment = currentTarget.closest("[data-hellotext--webchat-target='attachment']");
      this.files = this.files.filter(file => file.name !== attachment.dataset.name);
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
      var element = this.attachmentTemplateTarget.cloneNode(true);
      element.removeAttribute('hidden');
      element.style.display = 'flex';
      element.setAttribute('data-hellotext--webchat-target', 'attachment');
      return element;
    }
  }, {
    key: "onEmojiSelect",
    value: function onEmojiSelect(_ref2) {
      var {
        detail: emoji
      } = _ref2;
      var value = this.inputTarget.value;
      var start = this.inputTarget.selectionStart;
      var end = this.inputTarget.selectionEnd;
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
    get: function get() {
      return 300000;
    }
  }, {
    key: "middlewares",
    get: function get() {
      return [offset(5), shift({
        padding: 24
      }), flip()];
    }
  }]);
  return _default;
}(Controller);
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
  }
};
_default.targets = ['trigger', 'popover', 'input', 'attachmentInput', 'attachmentButton', 'errorMessageContainer', 'attachmentTemplate', 'attachmentContainer', 'attachment', 'messageTemplate', 'messagesContainer', 'title', 'onlineStatus', 'attachmentImage', 'footer', 'toolbar', 'message', 'unreadCounter'];
export { _default as default };