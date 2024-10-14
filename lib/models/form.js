"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Form = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _input_builder = require("../builders/input_builder");
var _logo_builder = require("../builders/logo_builder");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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
    key: "mount",
    value: function () {
      var _mount = _asyncToGenerator(function* () {
        var {
          ifCompleted = true
        } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        if (ifCompleted && this.hasBeenCompleted) {
          return;
        }
        var firstStep = this.data.steps[0];
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
      });
      function mount() {
        return _mount.apply(this, arguments);
      }
      return mount;
    }()
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
      var inputElements = inputs.map(input => _input_builder.InputBuilder.build(input));
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
      var element = _classPrivateFieldLooseBase(this, _findOrCreateComponent)[_findOrCreateComponent]('[data-form-footer]', 'footer');
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
      localStorage.setItem("hello-form-".concat(this.id), JSON.stringify({
        state: 'completed',
        data
      }));
      _hellotext.default.eventEmitter.dispatch('form:completed', _objectSpread({
        id: this.id
      }, data));
    }
  }, {
    key: "hasBeenCompleted",
    get: function get() {
      return localStorage.getItem("hello-form-".concat(this.id)) !== null;
    }
  }, {
    key: "id",
    get: function get() {
      return this.data.id;
    }
  }, {
    key: "localeAuthKey",
    get: function get() {
      var firstStep = this.data.steps[0];
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
    get: function get() {
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
  var existingElement = this.element.querySelector(selector);
  if (existingElement) {
    return existingElement.cloneNode(true);
  }
  var createdElement = document.createElement(tag);
  createdElement.setAttribute(selector.replace('[', '').replace(']', ''), '');
  return createdElement;
}