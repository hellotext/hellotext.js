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
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
var _formIdsToFetch = /*#__PURE__*/_classPrivateFieldLooseKey("formIdsToFetch");
var Forms = /*#__PURE__*/function () {
  function Forms() {
    _classCallCheck(this, Forms);
    Object.defineProperty(this, _formIdsToFetch, {
      get: _get_formIdsToFetch,
      set: void 0
    });
    this.forms = [];
    this.includes = this.includes.bind(this);
    this.excludes = this.excludes.bind(this);
  }
  _createClass(Forms, [{
    key: "collect",
    value: function collect() {
      var formsIdsToFetch = _classPrivateFieldLooseBase(this, _formIdsToFetch)[_formIdsToFetch];
      if (formsIdsToFetch.length === 0) return;
      var promises = formsIdsToFetch.map(id => {
        return fetch(_hellotext.default.__apiURL + 'public/forms/' + id, {
          headers: _hellotext.default.headers
        }).then(response => response.json());
      });
      if (!_hellotext.default.business.enabledWhitelist) {
        console.warn('No whitelist has been configured. It is advised to whitelist the domain to avoid bots from submitting forms.');
      }
      Promise.all(promises).then(forms => forms.forEach(form => this.add(form))).then(() => _hellotext.default.eventEmitter.emit('forms:collected', this));
    }
  }, {
    key: "add",
    value: function add(form) {
      if (this.includes(form.id)) return;
      this.forms.push(form);
    }
  }, {
    key: "includes",
    value: function includes(formId) {
      return this.forms.some(form => form.id === formId);
    }
  }, {
    key: "excludes",
    value: function excludes(id) {
      return !this.includes(id);
    }
  }, {
    key: "length",
    get: function get() {
      return this.forms.length;
    }
  }]);
  return Forms;
}();
exports.Forms = Forms;
function _get_formIdsToFetch() {
  return Array.from(document.querySelectorAll('[data-hello-form]')).map(form => form.dataset.helloForm).filter(this.excludes);
}