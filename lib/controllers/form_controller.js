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
import { Controller } from '@hotwired/stimulus';
import Hellotext from '../hellotext';
import { Form } from '../models';
import FormsAPI from '../api/forms';
import { Configuration } from '../core';
var _default = /*#__PURE__*/function (_Controller) {
  function _default() {
    _classCallCheck(this, _default);
    return _callSuper(this, _default, arguments);
  }
  _inherits(_default, _Controller);
  return _createClass(_default, [{
    key: "initialize",
    value: function initialize() {
      this.form = new Form(this.dataValue, this.element);
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
    value: function () {
      var _submit = _asyncToGenerator(function* (e) {
        e.preventDefault();
        if (this.invalid) {
          return this.showErrorMessages();
        }
        this.clearErrorMessages();
        this.formData = Object.fromEntries(new FormData(this.element));
        this.buttonTarget.disabled = true;
        var response = yield FormsAPI.submit(this.form.id, this.formData);
        this.buttonTarget.disabled = false;
        var data = yield response.json();
        if (response.failed) {
          data.errors.forEach(error => {
            var type = error.type,
              parameter = error.parameter;
            var input = this.inputTargets.find(input => input.name === parameter);
            input.setCustomValidity(Hellotext.business.locale.errors[type]);
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
      });
      function submit(_x) {
        return _submit.apply(this, arguments);
      }
      return submit;
    }()
  }, {
    key: "completed",
    value: function completed() {
      this.form.markAsCompleted(this.formData);
      if (!Configuration.forms.shouldShowSuccessMessage) {
        return this.element.remove();
      }
      if (typeof Configuration.forms.successMessage === 'string') {
        this.element.innerHTML = Configuration.forms.successMessage;
      } else {
        this.element.innerHTML = Hellotext.business.locale.forms[this.form.localeAuthKey];
      }
    }

    // private
  }, {
    key: "showErrorMessages",
    value: function showErrorMessages() {
      this.inputTargets.forEach(input => {
        var errorsContainer = input.closest('article').querySelector('[data-error-container]');
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
    get: function get() {
      return this.inputTargets.filter(input => input.required);
    }
  }, {
    key: "invalid",
    get: function get() {
      return !this.element.checkValidity();
    }
  }]);
}(Controller);
_default.values = {
  data: Object,
  step: {
    type: Number,
    default: 1
  }
};
_default.targets = ['inputContainer', 'input', 'button', 'otpContainer'];
export { _default as default };