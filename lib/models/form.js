"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Form = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _inputBuilder = require("../builders/inputBuilder");
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
var Form = /*#__PURE__*/function () {
  function Form(data) {
    var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    _classCallCheck(this, Form);
    Object.defineProperty(this, _findOrCreateComponent, {
      value: _findOrCreateComponent2
    });
    this.data = data;
    this.element = element || document.querySelector("[data-hello-form=\"".concat(this.id, "\"]")) || document.createElement('form');
  }
  _createClass(Form, [{
    key: "build",
    value: function build() {
      var firstStep = this.data.steps[0];
      this.buildHeader(firstStep.header);
      this.buildInputs(firstStep.inputs);
      this.buildButton(firstStep.button);
      this.buildFooter(firstStep.footer);
      this.element.setAttribute('data-controller', 'hellotext--form');
      this.element.setAttribute('data-hello-form', this.id);
      this.element.setAttribute('data-hellotext--form-data-value', JSON.stringify(this.data));
      this.element.setAttribute('data-action', 'hellotext--otp:verified->hellotext--form#completed');
    }
  }, {
    key: "buildHeader",
    value: function buildHeader(header) {
      var headerElement = _classPrivateFieldLooseBase(this, _findOrCreateComponent)[_findOrCreateComponent]('[data-form-header]', 'header');
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
      var inputsContainerElement = _classPrivateFieldLooseBase(this, _findOrCreateComponent)[_findOrCreateComponent]('[data-form-inputs]', 'main');
      var inputElements = inputs.map(input => _inputBuilder.InputBuilder.build(input));
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
      var buttonElement = _classPrivateFieldLooseBase(this, _findOrCreateComponent)[_findOrCreateComponent]('[data-form-button]', 'button');
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
      var element = _classPrivateFieldLooseBase(this, _findOrCreateComponent)[_findOrCreateComponent]('header', 'header');
      element.innerHTML = footer.content;
      if (this.element.querySelector('[data-form-footer]')) {
        this.element.querySelector('[data-form-footer]').replaceWith(element);
      } else {
        this.element.appendChild(element);
      }
    }
  }, {
    key: "buildOTPContainer",
    value: function buildOTPContainer(submissionId, label) {
      var template = this.otpTemplate(submissionId, label);
      var container = document.createElement('div');
      container.innerHTML = template;
      return container.firstElementChild;
    }
  }, {
    key: "markAsCompleted",
    value: function markAsCompleted() {
      localStorage.setItem("hello-form-".concat(this.id), 'completed');
      _hellotext.default.eventEmitter.emit('form:completed', {
        id: this.id
      });
    }
  }, {
    key: "otpTemplate",
    value: function otpTemplate(submissionId, paragraph) {
      return "\n      <article \n        data-controller=\"hellotext--otp\" \n        data-hellotext--otp-submission-id-value=\"".concat(submissionId, "\"\n        data-hellotext--form-target=\"otpContainer\"\n        data-form-otp\n        >\n        <header data-otp-header>\n          <p>").concat(paragraph, "</p>\n          <input \n            type=\"text\"\n            name=\"otp\"\n            data-hellotext--otp-target=\"input\"\n            placeholder=\"Enter your OTP\"\n            maxlength=\"6\"\n            />\n        </header>\n        \n        <footer data-otp-footer>\n          <button type=\"button\" data-hellotext--otp-target=\"resendButton\" data-action=\"hellotext--otp#resend\">Resend OTP</button>\n        </footer>\n      </article>\n    ");
    }
  }, {
    key: "id",
    get: function get() {
      return this.data.id;
    }
  }]);
  return Form;
}();
exports.Form = Form;
function _findOrCreateComponent2(selector, tag) {
  var existingElement = this.element.querySelector(selector);
  if (existingElement) {
    return existingElement.cloneNode(true);
  }
  var createdElement = document.createElement(tag);
  createdElement.setAttribute(selector.replace('[', '').replace(']', ''), '');
  return createdElement;
}