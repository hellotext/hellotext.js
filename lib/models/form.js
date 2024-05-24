"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Form = void 0;
var _inputBuilder = require("../builders/inputBuilder");
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
    _classCallCheck(this, Form);
    Object.defineProperty(this, _findOrCreateComponent, {
      value: _findOrCreateComponent2
    });
    this.data = data;
    this.element = document.querySelector("[data-hello-form=\"".concat(this.id, "\"]")) || document.createElement('form');
  }
  _createClass(Form, [{
    key: "build",
    value: function build() {
      this.data.steps.forEach(step => {
        this.buildHeader(step.header);
        this.buildInputs(step.inputs);
        this.buildButton(step.button);
        this.buildFooter(step.footer);
      });
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
      var buttonElement = _classPrivateFieldLooseBase(this, _findOrCreateComponent)[_findOrCreateComponent]('[data-form-button]', 'section');
      buttonElement.innerText = button.text;
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