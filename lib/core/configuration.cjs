"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Configuration = void 0;
var _forms = require("./configuration/forms");
var _locale = require("./configuration/locale");
var _popup = require("./configuration/popup");
var _webchat = require("./configuration/webchat");
var _whatsapp = require("./configuration/whatsapp");
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @class Configuration
 * @classdesc
 * Configuration for Hellotext
 * @property {Boolean} [autoGenerateSession=true] - whether to auto generate session or not
 * @property {String} [session] - session id
 * @property {Forms} [forms] - form configuration
 * @property {Popup} [popup] - popup configuration
 * @property {Webchat} [webchat] - webchat configuration
 * @property {WhatsApp} [whatsappWidget] - WhatsApp widget configuration
 * @property {Locale} [locale] - locale configuration
 */
let Configuration = exports.Configuration = /*#__PURE__*/function () {
  function Configuration() {
    _classCallCheck(this, Configuration);
  }
  return _createClass(Configuration, null, [{
    key: "assign",
    value:
    /**
     *
     * @param props
     * @param {Boolean} [props.autoGenerateSession=true] - whether to auto generate session or not
     * @param {String} [props.session] - session id
     * @param {Object} [props.forms] - form configuration
     * @returns {Configuration}
     */
    function assign(props) {
      if (props) {
        const shouldInferActionCableUrl = Object.prototype.hasOwnProperty.call(props, 'apiRoot') && !Object.prototype.hasOwnProperty.call(props, 'actionCableUrl');
        Object.entries(props).forEach(([key, value]) => {
          if (key === 'forms') {
            this.forms = _forms.Forms.assign(value);
          } else if (key === 'popup') {
            this.popup = _popup.Popup.assign(value);
          } else if (key === 'webchat') {
            this.webchat = _webchat.Webchat.assign(value);
          } else if (key === 'whatsappWidget') {
            this.whatsapp = _whatsapp.WhatsApp.assign(value);
          } else {
            this[key] = value;
          }
        });
        if (shouldInferActionCableUrl) {
          this.actionCableUrl = this.actionCableUrlForApiRoot(this.apiRoot);
        }
      }
      return this;
    }
  }, {
    key: "locale",
    get: function () {
      return _locale.Locale.toString();
    },
    set: function (locale) {
      _locale.Locale.identifier = locale;
    }
  }, {
    key: "endpoint",
    value: function endpoint(path) {
      return `${this.apiRoot}/${path}`;
    }
  }, {
    key: "actionCableUrlForApiRoot",
    value: function actionCableUrlForApiRoot(apiRoot) {
      try {
        const url = new URL(apiRoot);
        const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        url.protocol = protocol;
        url.pathname = '/cable';
        url.search = '';
        url.hash = '';
        return url.toString();
      } catch (_) {
        return this.actionCableUrl;
      }
    }
  }]);
}();
Configuration.apiRoot = 'https://api.hellotext.com/v1';
Configuration.actionCableUrl = 'wss://www.hellotext.com/cable';
Configuration.autoGenerateSession = true;
Configuration.session = null;
Configuration.forms = _forms.Forms;
Configuration.popup = _popup.Popup;
Configuration.webchat = _webchat.Webchat;
Configuration.whatsapp = _whatsapp.WhatsApp;