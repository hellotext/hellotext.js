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
      this.form = new _models.Form(this.dataValue, this.element);
    }
  }, {
    key: "connect",
    value: function connect() {
      _get(_getPrototypeOf(_default.prototype), "connect", this).call(this);
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
  return _default;
}(_stimulus.Controller);
exports.default = _default;
_default.values = {
  data: Object,
  step: {
    type: Number,
    default: 1
  }
};
_default.targets = ['inputContainer', 'input', 'button', 'otpContainer'];