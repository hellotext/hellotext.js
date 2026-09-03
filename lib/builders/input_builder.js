function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import Hellotext from '../hellotext';
var InputBuilder = /*#__PURE__*/function () {
  function InputBuilder() {
    _classCallCheck(this, InputBuilder);
  }
  return _createClass(InputBuilder, null, [{
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
          input.value = "+".concat(Hellotext.business.country.prefix);
          input.setAttribute('data-default-value', "+".concat(Hellotext.business.country.prefix));
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
}();
export { InputBuilder };