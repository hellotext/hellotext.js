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
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldLooseBase(e, t) { if (!{}.hasOwnProperty.call(e, t)) throw new TypeError("attempted to use private field on non-instance"); return e; }
var id = 0;
function _classPrivateFieldLooseKey(e) { return "__private_" + id++ + "_" + e; }
var _formIdsToFetch = /*#__PURE__*/_classPrivateFieldLooseKey("formIdsToFetch");
let FormCollection = exports.FormCollection = /*#__PURE__*/function () {
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
  return _createClass(FormCollection, [{
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
        _hellotext.default.business.setLocale(_core.Locale.toString());
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
}();
function _get_formIdsToFetch() {
  return Array.from(document.querySelectorAll('[data-hello-form]')).map(form => form.dataset.helloForm).filter(this.excludes);
}