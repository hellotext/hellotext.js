function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldLooseBase(e, t) { if (!{}.hasOwnProperty.call(e, t)) throw new TypeError("attempted to use private field on non-instance"); return e; }
var id = 0;
function _classPrivateFieldLooseKey(e) { return "__private_" + id++ + "_" + e; }
import Hellotext from '../hellotext';
import { InputBuilder } from '../builders/input_builder';
import { LogoBuilder } from '../builders/logo_builder';
import { setSanitizedRichText } from '../core/sanitize_html';
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
  return _createClass(Form, [{
    key: "mount",
    value: function () {
      var _mount = _asyncToGenerator(function* () {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$ifCompleted = _ref.ifCompleted,
          ifCompleted = _ref$ifCompleted === void 0 ? true : _ref$ifCompleted;
        if (ifCompleted && this.hasBeenCompleted) {
          var _this$element;
          (_this$element = this.element) === null || _this$element === void 0 || _this$element.remove();
          return Hellotext.eventEmitter.dispatch('form:completed', _objectSpread({
            id: this.id
          }, JSON.parse(localStorage.getItem("hello-form-".concat(this.id)))));
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
        if (!Hellotext.business.features.white_label) {
          this.element.prepend(LogoBuilder.build());
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
      setSanitizedRichText(headerElement, header.content);
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
      var inputElements = inputs.map(input => InputBuilder.build(input));
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
      setSanitizedRichText(element, footer.content);
      if (this.element.querySelector('[data-form-footer]')) {
        this.element.querySelector('[data-form-footer]').replaceWith(element);
      } else {
        this.element.appendChild(element);
      }
    }
  }, {
    key: "markAsCompleted",
    value: function markAsCompleted(data) {
      var payload = {
        state: 'completed',
        id: this.id,
        data,
        completedAt: new Date().getTime()
      };
      localStorage.setItem("hello-form-".concat(this.id), JSON.stringify(payload));
      Hellotext.eventEmitter.dispatch('form:completed', payload);
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
}();
function _findOrCreateComponent2(selector, tag) {
  var existingElement = this.element.querySelector(selector);
  if (existingElement) {
    return existingElement.cloneNode(true);
  }
  var createdElement = document.createElement(tag);
  createdElement.setAttribute(selector.replace('[', '').replace(']', ''), '');
  return createdElement;
}
export { Form };