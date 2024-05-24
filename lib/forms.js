"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Forms = void 0;
var _hellotext = _interopRequireDefault(require("./hellotext.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
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
    key: "collect",
    value: function () {
      var _collect = _asyncToGenerator(function* () {
        Array.from(document.querySelectorAll('[data-hello-form]')).map(form => form.dataset.helloForm).forEach(id => {
          fetch(_hellotext.default.__apiURL + 'public/forms/' + id, {
            headers: _hellotext.default.headers
          }).then(response => response.json()).then(data => this.add(data));
        });
      });
      function collect() {
        return _collect.apply(this, arguments);
      }
      return collect;
    }()
  }, {
    key: "add",
    value: function add(form) {
      this.forms.push(form);
    }
  }]);
  return Forms;
}();
exports.Forms = Forms;