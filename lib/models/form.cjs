"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Form = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _input_builder = require("../builders/input_builder");
var _logo_builder = require("../builders/logo_builder");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
var _findOrCreateComponent = /*#__PURE__*/_classPrivateFieldLooseKey("findOrCreateComponent");
let Form = /*#__PURE__*/function () {
  function Form(data, element = null) {
    _classCallCheck(this, Form);
    Object.defineProperty(this, _findOrCreateComponent, {
      value: _findOrCreateComponent2
    });
    this.data = data;
    this.element = element || document.querySelector(`[data-hello-form="${this.id}"]`) || document.createElement('form');
  }
  _createClass(Form, [{
    key: "mount",
    value: async function mount({
      ifCompleted = true
    } = {}) {
      if (ifCompleted && this.hasBeenCompleted) {
        var _this$element;
        (_this$element = this.element) === null || _this$element === void 0 ? void 0 : _this$element.remove();
        return _hellotext.default.eventEmitter.dispatch('form:completed', {
          id: this.id,
          ...JSON.parse(localStorage.getItem(`hello-form-${this.id}`))
        });
      }
      const firstStep = this.data.steps[0];
      this.buildHeader(firstStep.header);
      this.buildInputs(firstStep.inputs);
      this.buildButton(firstStep.button);
      this.buildFooter(firstStep.footer);
      this.elementAttributes.forEach(attribute => {
        this.element.setAttribute(attribute.name, attribute.value);
      });
      if (!document.contains(this.element)) {
        document.body.appendChild(this.element);
      }
      if (!_hellotext.default.business.features.white_label) {
        this.element.prepend(_logo_builder.LogoBuilder.build());
      }
    }
  }, {
    key: "buildHeader",
    value: function buildHeader(header) {
      const headerElement = _classPrivateFieldLooseBase(this, _findOrCreateComponent)[_findOrCreateComponent]('[data-form-header]', 'header');
      headerElement.innerHTML = header.content;
      if (this.element.querySelector('[data-form-header]')) {
        this.element.querySelector('[data-form-header]').replaceWith(headerElement);
      } else {
        this.element.prepend(headerElement);
      }
    }
  }, {
    key: "buildInputs",
    value: function buildInputs(inputs) {
      const inputsContainerElement = _classPrivateFieldLooseBase(this, _findOrCreateComponent)[_findOrCreateComponent]('[data-form-inputs]', 'main');
      const inputElements = inputs.map(input => _input_builder.InputBuilder.build(input));
      inputElements.forEach(inputElement => inputsContainerElement.appendChild(inputElement));
      if (this.element.querySelector('[data-form-inputs]')) {
        this.element.querySelector('[data-form-inputs]').replaceWith(inputsContainerElement);
      } else {
        this.element.querySelector('[data-form-header]').insertAdjacentHTML('afterend', inputsContainerElement.outerHTML);
      }
    }
  }, {
    key: "buildButton",
    value: function buildButton(button) {
      const buttonElement = _classPrivateFieldLooseBase(this, _findOrCreateComponent)[_findOrCreateComponent]('[data-form-button]', 'button');
      buttonElement.innerText = button.text;
      buttonElement.setAttribute('data-action', 'click->hellotext--form#submit');
      buttonElement.setAttribute('data-hellotext--form-target', 'button');
      if (this.element.querySelector('[data-form-button]')) {
        this.element.querySelector('[data-form-button]').replaceWith(buttonElement);
      } else {
        this.element.querySelector('[data-form-inputs]').insertAdjacentHTML('afterend', buttonElement.outerHTML);
      }
    }
  }, {
    key: "buildFooter",
    value: function buildFooter(footer) {
      const element = _classPrivateFieldLooseBase(this, _findOrCreateComponent)[_findOrCreateComponent]('[data-form-footer]', 'footer');
      element.innerHTML = footer.content;
      if (this.element.querySelector('[data-form-footer]')) {
        this.element.querySelector('[data-form-footer]').replaceWith(element);
      } else {
        this.element.appendChild(element);
      }
    }
  }, {
    key: "markAsCompleted",
    value: function markAsCompleted(data) {
      const payload = {
        state: 'completed',
        id: this.id,
        data,
        completedAt: new Date().getTime()
      };
      localStorage.setItem(`hello-form-${this.id}`, JSON.stringify(payload));
      _hellotext.default.eventEmitter.dispatch('form:completed', payload);
    }
  }, {
    key: "hasBeenCompleted",
    get: function () {
      return localStorage.getItem(`hello-form-${this.id}`) !== null;
    }
  }, {
    key: "id",
    get: function () {
      return this.data.id;
    }
  }, {
    key: "localeAuthKey",
    get: function () {
      const firstStep = this.data.steps[0];
      if (firstStep.inputs.some(input => input.kind === 'email') && firstStep.inputs.some(input => input.kind === 'phone')) {
        return 'phone_and_email';
      } else if (firstStep.inputs.some(input => input.kind === 'email')) {
        return 'email';
      } else if (firstStep.inputs.some(input => input.kind === 'phone')) {
        return 'phone';
      } else {
        return 'none';
      }
    }
  }, {
    key: "elementAttributes",
    get: function () {
      return [{
        name: 'data-controller',
        value: 'hellotext--form'
      }, {
        name: 'data-hello-form',
        value: this.id
      }, {
        name: 'data-hellotext--form-data-value',
        value: JSON.stringify(this.data)
      }];
    }
  }]);
  return Form;
}();
exports.Form = Form;
function _findOrCreateComponent2(selector, tag) {
  const existingElement = this.element.querySelector(selector);
  if (existingElement) {
    return existingElement.cloneNode(true);
  }
  const createdElement = document.createElement(tag);
  createdElement.setAttribute(selector.replace('[', '').replace(']', ''), '');
  return createdElement;
}