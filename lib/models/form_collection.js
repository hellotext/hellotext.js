function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
import API from '../api/forms';
import Hellotext from '../hellotext';
import { Configuration } from '../core';
import { Form } from './form';
import { NotInitializedError } from '../errors';
var _formIdsToFetch = /*#__PURE__*/_classPrivateFieldLooseKey("formIdsToFetch");
var FormCollection = /*#__PURE__*/function () {
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
    key: "formMutationObserver",
    value: function formMutationObserver(mutations) {
      var mutation = mutations.find(mutation => mutation.type === 'childList' && mutation.addedNodes.length > 0);
      if (!mutation) return;
      var forms = Array.from(document.querySelectorAll('[data-hello-form]'));
      if (forms && Configuration.forms.autoMount) {
        this.collect();
      }
    }
  }, {
    key: "collect",
    value: function () {
      var _collect = _asyncToGenerator(function* () {
        if (Hellotext.notInitialized) {
          throw new NotInitializedError();
        }
        if (this.fetching) return;
        if (typeof document === 'undefined' || !('querySelectorAll' in document)) {
          return console.warn('Document is not defined, collection is not possible. Please make sure to initialize the library after the document is loaded.');
        }
        var formsIdsToFetch = _classPrivateFieldLooseBase(this, _formIdsToFetch)[_formIdsToFetch];
        if (formsIdsToFetch.length === 0) return;
        var promises = formsIdsToFetch.map(id => {
          return API.get(id).then(response => response.json());
        });
        this.fetching = true;
        yield Promise.all(promises).then(forms => forms.forEach(this.add)).then(() => Hellotext.eventEmitter.dispatch('forms:collected', this)).then(() => this.fetching = false);
        if (Configuration.forms.autoMount) {
          this.forms.forEach(form => form.mount());
        }
      });
      function collect() {
        return _collect.apply(this, arguments);
      }
      return collect;
    }()
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
      this.forms.push(new Form(data));
      if (!Hellotext.business.data) {
        Hellotext.business.setData(data.business);
      }
      if (!Hellotext.business.enabledWhitelist) {
        console.warn('No whitelist has been configured. It is advised to whitelist the domain to avoid bots from submitting forms.');
      }
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
    get: function get() {
      return this.forms.length;
    }
  }]);
  return FormCollection;
}();
function _get_formIdsToFetch() {
  return Array.from(document.querySelectorAll('[data-hello-form]')).map(form => form.dataset.helloForm).filter(this.excludes);
}
export { FormCollection };