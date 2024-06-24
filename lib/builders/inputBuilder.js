"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputBuilder = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var InputBuilder = /*#__PURE__*/function () {
  function InputBuilder() {
    _classCallCheck(this, InputBuilder);
  }
  _createClass(InputBuilder, null, [{
    key: "build",
    value: function build(data) {
      var article = document.createElement('article');
      var label = document.createElement('label');
      var input = document.createElement('input');
      label.innerText = data.label;
      input.type = data.type;
      input.required = data.required;
      input.placeholder = data.placeholder;
      if (['first_name', 'last_name'].includes(data.kind)) {
        input.type = 'text';
        input.id = input.name = data.kind;
        label.setAttribute('for', data.kind);
      } else {
        input.type = data.type;
        if (data.type === 'email') {
          input.id = input.name = 'email';
          label.setAttribute('for', 'email');
        } else if (input.type === 'tel') {
          input.id = input.name = 'phone';
          label.setAttribute('for', 'phone');
          input.value = "+".concat(_hellotext.default.business.country.prefix);
          input.selectionStart = input.selectionEnd = input.value.length;
        } else {
          input.name = input.id = "property_by_id[".concat(data.property, "]");
          label.setAttribute('for', "property_by_id[".concat(data.property, "]"));
        }
      }
      var main = document.createElement('main');
      main.appendChild(label);
      main.appendChild(input);
      article.appendChild(main);
      article.setAttribute('data-hellotext--form-target', 'inputContainer');
      input.setAttribute('data-hellotext--form-target', 'input');
      var errorContainer = document.createElement('div');
      errorContainer.setAttribute('data-error-container', '');
      article.appendChild(errorContainer);
      return article;
    }
  }]);
  return InputBuilder;
}();
exports.InputBuilder = InputBuilder;