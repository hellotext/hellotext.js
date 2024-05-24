"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputBuilder = void 0;
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
        input.kind = 'text';
        input.name = data.kind;
      } else {
        input.kind = data.kind;
        input.name = "property_by_id[".concat(data.property, "]");
      }
      article.appendChild(label);
      article.appendChild(input);
      return article;
    }
  }]);
  return InputBuilder;
}();
exports.InputBuilder = InputBuilder;