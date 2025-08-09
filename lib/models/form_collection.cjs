"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormCollection = void 0;
var _forms = _interopRequireDefault(require("../api/forms"));
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _core = require("../core");
var _form = require("./form");
var _errors = require("../errors");
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
let FormCollection = /*#__PURE__*/function () {
  function FormCollection() {
    _classCallCheck(this, FormCollection);
    Object.defineProperty(this, _formIdsToFetch, {
      get: _get_formIdsToFetch,
      set: void 0
    });
    this.forms = [];
    this.includes = this.includes.bind(this);
    this.excludes = this.excludes.bind(this);
    this.add = this.add.bind(this);
    if (typeof MutationObserver !== 'undefined') {
      this.mutationObserver = new MutationObserver(this.formMutationObserver.bind(this));
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
  _createClass(FormCollection, [{
    key: "collectExistingFormsOnPage",
    value: function collectExistingFormsOnPage() {
      if (Array.from(document.querySelectorAll('[data-hello-form]')).length > 0) {
        this.collect();
      }
    }
  }, {
    key: "formMutationObserver",
    value: function formMutationObserver(mutations) {
      const mutation = mutations.find(mutation => mutation.type === 'childList' && mutation.addedNodes.length > 0);
      if (!mutation) return;
      if (Array.from(document.querySelectorAll('[data-hello-form]')).length > 0) {
        this.collect();
      }
    }
  }, {
    key: "collect",
    value: async function collect() {
      if (_hellotext.default.notInitialized) {
        throw new _errors.NotInitializedError();
      }
      if (this.fetching) return;
      if (typeof document === 'undefined' || !('querySelectorAll' in document)) {
        return console.warn('Document is not defined, collection is not possible. Please make sure to initialize the library after the document is loaded.');
      }
      const formsIdsToFetch = _classPrivateFieldLooseBase(this, _formIdsToFetch)[_formIdsToFetch];
      if (formsIdsToFetch.length === 0) return;
      const promises = formsIdsToFetch.map(id => {
        return _forms.default.get(id).then(response => response.json());
      });
      this.fetching = true;
      await Promise.all(promises).then(forms => forms.forEach(this.add)).then(() => _hellotext.default.eventEmitter.dispatch('forms:collected', this)).then(() => this.fetching = false);
      if (_core.Configuration.forms.autoMount) {
        this.forms.forEach(form => form.mount());
      }
    }
  }, {
    key: "forEach",
    value: function forEach(callback) {
      this.forms.forEach(callback);
    }
  }, {
    key: "map",
    value: function map(callback) {
      return this.forms.map(callback);
    }
  }, {
    key: "add",
    value: function add(data) {
      if (this.includes(data.id)) return;
      if (!_hellotext.default.business.data) {
        _hellotext.default.business.setData(data.business);
      }
      if (!_hellotext.default.business.enabledWhitelist) {
        console.warn('No whitelist has been configured. It is advised to whitelist the domain to avoid bots from submitting forms.');
      }
      this.forms.push(new _form.Form(data));
    }
  }, {
    key: "getById",
    value: function getById(id) {
      return this.forms.find(form => form.id === id);
    }
  }, {
    key: "getByIndex",
    value: function getByIndex(index) {
      return this.forms[index];
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
    get: function () {
      return this.forms.length;
    }
  }]);
  return FormCollection;
}();
exports.FormCollection = FormCollection;
function _get_formIdsToFetch() {
  return Array.from(document.querySelectorAll('[data-hello-form]')).map(form => form.dataset.helloForm).filter(this.excludes);
}