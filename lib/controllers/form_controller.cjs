"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _stimulus = require("@hotwired/stimulus");
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _models = require("../models");
var _forms = _interopRequireDefault(require("../api/forms"));
var _core = require("../core");
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
let _default = exports.default = /*#__PURE__*/function (_Controller) {
  function _default() {
    _classCallCheck(this, _default);
    return _callSuper(this, _default, arguments);
  }
  _inherits(_default, _Controller);
  return _createClass(_default, [{
    key: "initialize",
    value: function initialize() {
      this.form = new _models.Form(this.dataValue, this.element);
    }
  }, {
    key: "connect",
    value: function connect() {
      _superPropGet(_default, "connect", this, 3)([]);
      this.element.addEventListener('submit', this.submit.bind(this));
      if (document.activeElement.tagName !== 'INPUT') {
        this.inputTargets[0].focus();
      }
    }
  }, {
    key: "submit",
    value: async function submit(e) {
      e.preventDefault();
      if (this.invalid) {
        return this.showErrorMessages();
      }
      this.clearErrorMessages();
      this.formData = Object.fromEntries(new FormData(this.element));
      this.buttonTarget.disabled = true;
      const response = await _forms.default.submit(this.form.id, this.formData);
      this.buttonTarget.disabled = false;
      const data = await response.json();
      if (response.failed) {
        data.errors.forEach(error => {
          const {
            type,
            parameter
          } = error;
          const input = this.inputTargets.find(input => input.name === parameter);
          input.setCustomValidity(_hellotext.default.business.locale.errors[type]);
          input.reportValidity();
          input.addEventListener('input', () => {
            input.setCustomValidity('');
            input.reportValidity();
          });
        });
        return this.showErrorMessages();
      }
      this.buttonTarget.style.display = 'none';
      this.element.querySelectorAll('input').forEach(input => input.disabled = true);
      this.completed();
    }
  }, {
    key: "completed",
    value: function completed() {
      this.form.markAsCompleted(this.formData);
      if (!_core.Configuration.forms.shouldShowSuccessMessage) {
        return this.element.remove();
      }
      if (typeof _core.Configuration.forms.successMessage === 'string') {
        this.element.innerHTML = _core.Configuration.forms.successMessage;
      } else {
        this.element.innerHTML = _hellotext.default.business.locale.forms[this.form.localeAuthKey];
      }
    }

    // private
  }, {
    key: "showErrorMessages",
    value: function showErrorMessages() {
      this.inputTargets.forEach(input => {
        const errorsContainer = input.closest('article').querySelector('[data-error-container]');
        if (input.validity.valid) {
          errorsContainer.innerText = '';
        } else {
          errorsContainer.innerText = input.validationMessage;
        }
      });
    }
  }, {
    key: "clearErrorMessages",
    value: function clearErrorMessages() {
      this.inputTargets.forEach(input => {
        input.setCustomValidity('');
        input.closest('article').querySelector('[data-error-container]').innerText = '';
      });
    }
  }, {
    key: "inputTargetConnected",
    value: function inputTargetConnected(target) {
      if (target.getAttribute('data-default-value')) {
        target.value = target.getAttribute('data-default-value');
      }
    }
  }, {
    key: "requiredInputs",
    get: function () {
      return this.inputTargets.filter(input => input.required);
    }
  }, {
    key: "invalid",
    get: function () {
      return !this.element.checkValidity();
    }
  }]);
}(_stimulus.Controller);
_default.values = {
  data: Object,
  step: {
    type: Number,
    default: 1
  }
};
_default.targets = ['inputContainer', 'input', 'button', 'otpContainer'];