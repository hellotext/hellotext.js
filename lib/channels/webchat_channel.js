"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _application_channel = _interopRequireDefault(require("./application_channel"));
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
var WebchatChannel = /*#__PURE__*/function (_ApplicationChannel) {
  _inherits(WebchatChannel, _ApplicationChannel);
  var _super = _createSuper(WebchatChannel);
  function WebchatChannel(id, session, conversation) {
    var _this;
    _classCallCheck(this, WebchatChannel);
    _this = _super.call(this);
    _this.id = id;
    _this.session = session;
    _this.conversation = conversation;
    _this.subscribe();
    return _this;
  }
  _createClass(WebchatChannel, [{
    key: "subscribe",
    value: function subscribe() {
      var params = {
        channel: "WebchatChannel",
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
      var params = {
        channel: "WebchatChannel",
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
    key: "onMessage",
    value: function onMessage(callback) {
      _get(_getPrototypeOf(WebchatChannel.prototype), "onMessage", this).call(this, message => {
        if (message.type !== 'message') return;
        callback(message);
      });
    }
  }, {
    key: "onConversationAssignment",
    value: function onConversationAssignment(callback) {
      _get(_getPrototypeOf(WebchatChannel.prototype), "onMessage", this).call(this, message => {
        if (message.type === 'conversation.assigned') {
          callback(message);
        }
      });
    }
  }, {
    key: "onAgentOnline",
    value: function onAgentOnline(callback) {
      _get(_getPrototypeOf(WebchatChannel.prototype), "onMessage", this).call(this, message => {
        if (message.type === 'agent_is_online') {
          callback(message);
        }
      });
    }
  }, {
    key: "onReaction",
    value: function onReaction(callback) {
      _get(_getPrototypeOf(WebchatChannel.prototype), "onMessage", this).call(this, message => {
        if (message.type === 'reaction.create' || message.type === 'reaction.destroy') {
          callback(message);
        }
      });
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
  return WebchatChannel;
}(_application_channel.default);
var _default = WebchatChannel;
exports.default = _default;