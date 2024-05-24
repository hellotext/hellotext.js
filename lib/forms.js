"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Forms = void 0;
var _hellotext = _interopRequireDefault(require("./hellotext.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Forms = /*#__PURE__*/function () {
  function Forms() {
    _classCallCheck(this, Forms);
    this.forms = [];
  }
  _createClass(Forms, [{
    key: "add",
    value: function add(form) {
      this.forms.push(form);
    }
  }], [{
    key: "collect",
    value: function collect() {
      var forms = new Forms();
      window.addEventListener('load', () => {
        Array.from(document.querySelectorAll('[data-hello-form]')).map(form => form.dataset.helloForm).forEach(id => {
          fetch(_hellotext.default.__apiURL + '/public/forms/' + id, {
            headers: _hellotext.default.headers
          }).then(response => response.json()).then(data => forms.add(data));
        });
      });
    }
  }]);
  return Forms;
}();
exports.Forms = Forms;