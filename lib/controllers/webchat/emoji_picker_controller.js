function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == typeof e || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
import { autoPlacement, offset, shift } from '@floating-ui/dom';
import { Controller } from '@hotwired/stimulus';
import { usePopover } from '../mixins/usePopover';
var _default = /*#__PURE__*/function (_Controller) {
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
      usePopover(this);
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
    value: function () {
      var _onPopoverOpened = _asyncToGenerator(function* () {
        yield this.loadPicker();
      });
      function onPopoverOpened() {
        return _onPopoverOpened.apply(this, arguments);
      }
      return onPopoverOpened;
    }()
  }, {
    key: "loadPicker",
    value: function () {
      var _loadPicker = _asyncToGenerator(function* () {
        if (this.pickerLoaded) return;
        this.pickerLoadPromise || (this.pickerLoadPromise = this.loadPickerDependencies());
        var _yield$this$pickerLoa = yield this.pickerLoadPromise,
          Picker = _yield$this$pickerLoa.Picker,
          i18n = _yield$this$pickerLoa.i18n;
        if (!this.connected || this.pickerLoaded) return;
        this.popoverTarget.appendChild(this.buildPicker(Picker, i18n));
        this.pickerLoaded = true;
      });
      function loadPicker() {
        return _loadPicker.apply(this, arguments);
      }
      return loadPicker;
    }()
  }, {
    key: "loadPickerDependencies",
    value: function () {
      var _loadPickerDependencies = _asyncToGenerator(function* () {
        var _yield$Promise$all = yield Promise.all([import(/* webpackChunkName: "webchat-emoji" */'emoji-mart'), this.loadI18n()]),
          _yield$Promise$all2 = _slicedToArray(_yield$Promise$all, 2),
          pickerModule = _yield$Promise$all2[0],
          i18nModule = _yield$Promise$all2[1];
        return {
          Picker: pickerModule.Picker,
          i18n: i18nModule.default || i18nModule
        };
      });
      function loadPickerDependencies() {
        return _loadPickerDependencies.apply(this, arguments);
      }
      return loadPickerDependencies;
    }()
  }, {
    key: "loadI18n",
    value: function loadI18n() {
      if (Hellotext.business.locale === 'es') {
        return import(/* webpackChunkName: "webchat-emoji-es" */'@emoji-mart/data/i18n/es.json');
      }
      return import(/* webpackChunkName: "webchat-emoji-en" */'@emoji-mart/data/i18n/en.json');
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
    get: function get() {
      return [offset(5), shift({
        padding: 24
      }), autoPlacement({
        allowedPlacements: ['top', 'bottom']
      })];
    }
  }]);
}(Controller);
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
export { _default as default };