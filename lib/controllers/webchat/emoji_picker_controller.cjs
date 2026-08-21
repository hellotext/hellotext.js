"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dom = require("@floating-ui/dom");
var _stimulus = require("@hotwired/stimulus");
var _usePopover = require("../mixins/usePopover");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
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
let _default = exports.default = /*#__PURE__*/function (_Controller) {
  function _default() {
    _classCallCheck(this, _default);
    return _callSuper(this, _default, arguments);
  }
  _inherits(_default, _Controller);
  return _createClass(_default, [{
    key: "initialize",
    value: function initialize() {
      this.onEmojiSelect = this.onEmojiSelect.bind(this);
      this.pickerLoaded = false;
      this.pickerLoadPromise = null;
      this.connected = false;
      _superPropGet(_default, "initialize", this, 3)([]);
    }
  }, {
    key: "connect",
    value: function connect() {
      this.connected = true;
      (0, _usePopover.usePopover)(this);
      this.setupFloatingUI({
        trigger: this.buttonTarget,
        popover: this.popoverTarget,
        strategy: 'absolute'
      });
      _superPropGet(_default, "connect", this, 3)([]);
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this.connected = false;
      this.pickerLoadPromise = null;
      this.floatingUICleanup();
      _superPropGet(_default, "disconnect", this, 3)([]);
    }
  }, {
    key: "onEmojiSelect",
    value: function onEmojiSelect(emoji) {
      this.dispatch('selected', {
        detail: emoji.native
      });
      this.hide();
    }
  }, {
    key: "onClickOutside",
    value: function onClickOutside(event) {
      if (this.openValue && event.target.nodeType && this.element.contains(event.target) === false) {
        this.openValue = false;
      }
    }
  }, {
    key: "onPopoverOpened",
    value: async function onPopoverOpened() {
      await this.loadPicker();
    }
  }, {
    key: "loadPicker",
    value: async function loadPicker() {
      if (this.pickerLoaded) return;
      this.pickerLoadPromise || (this.pickerLoadPromise = this.loadPickerDependencies());
      const {
        Picker,
        i18n
      } = await this.pickerLoadPromise;
      if (!this.connected || this.pickerLoaded) return;
      this.popoverTarget.appendChild(this.buildPicker(Picker, i18n));
      this.pickerLoaded = true;
    }
  }, {
    key: "loadPickerDependencies",
    value: async function loadPickerDependencies() {
      const [pickerModule, i18nModule] = await Promise.all([Promise.resolve().then(() => _interopRequireWildcard(require(/* webpackChunkName: "webchat-emoji" */'emoji-mart'))), this.loadI18n()]);
      return {
        Picker: pickerModule.Picker,
        i18n: i18nModule.default || i18nModule
      };
    }
  }, {
    key: "loadI18n",
    value: function loadI18n() {
      if (Hellotext.business.locale === 'es') {
        return Promise.resolve().then(() => _interopRequireWildcard(require(/* webpackChunkName: "webchat-emoji-es" */'@emoji-mart/data/i18n/es.json')));
      }
      return Promise.resolve().then(() => _interopRequireWildcard(require(/* webpackChunkName: "webchat-emoji-en" */'@emoji-mart/data/i18n/en.json')));
    }
  }, {
    key: "buildPicker",
    value: function buildPicker(Picker, i18n) {
      return new Picker({
        onEmojiSelect: this.onEmojiSelect,
        theme: 'light',
        dynamicWidth: true,
        previewPosition: 'none',
        skinTonePosition: 'none',
        emojiSize: this.sizeValue,
        perLine: this.perLineValue,
        i18n
      });
    }
  }, {
    key: "middlewares",
    get: function () {
      return [(0, _dom.offset)(5), (0, _dom.shift)({
        padding: 24
      }), (0, _dom.autoPlacement)({
        allowedPlacements: ['top', 'bottom']
      })];
    }
  }]);
}(_stimulus.Controller);
_default.targets = ['button', 'popover'];
_default.values = {
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
  size: {
    type: Number,
    default: 24
  },
  perLine: {
    type: Number,
    default: 9
  }
};