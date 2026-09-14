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
class FormCollection {
  constructor() {
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
  collectExistingFormsOnPage() {
    if (Array.from(document.querySelectorAll('[data-hello-form]')).length > 0) {
      this.collect();
    }
  }
  formMutationObserver(mutations) {
    const mutation = mutations.find(mutation => mutation.type === 'childList' && mutation.addedNodes.length > 0);
    if (!mutation) return;
    if (Array.from(document.querySelectorAll('[data-hello-form]')).length > 0) {
      this.collect();
    }
  }
  async collect() {
    if (_hellotext.default.notInitialized) {
      throw new _errors.NotInitializedError();
    }
    if (this.fetching) return;
    if (typeof document === 'undefined' || !('querySelectorAll' in document)) {
      return console.warn('Document is not defined, collection is not possible. Please make sure to initialize the library after the document is loaded.');
    }
    const formsIdsToFetch = this.#formIdsToFetch;
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
  forEach(callback) {
    this.forms.forEach(callback);
  }
  map(callback) {
    return this.forms.map(callback);
  }
  add(data) {
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
  getById(id) {
    return this.forms.find(form => form.id === id);
  }
  getByIndex(index) {
    return this.forms[index];
  }
  includes(formId) {
    return this.forms.some(form => form.id === formId);
  }
  excludes(id) {
    return !this.includes(id);
  }
  get length() {
    return this.forms.length;
  }
  get #formIdsToFetch() {
    return Array.from(document.querySelectorAll('[data-hello-form]')).map(form => form.dataset.helloForm).filter(this.excludes);
  }
}
exports.FormCollection = FormCollection;