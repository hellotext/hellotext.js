function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Forms } from './configuration/forms';
import { Locale } from './configuration/locale';
import { Popup } from './configuration/popup';
import { Webchat } from './configuration/webchat';
import { WhatsApp } from './configuration/whatsapp';

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
var Configuration = /*#__PURE__*/function () {
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
        var shouldInferActionCableUrl = Object.prototype.hasOwnProperty.call(props, 'apiRoot') && !Object.prototype.hasOwnProperty.call(props, 'actionCableUrl');
        Object.entries(props).forEach(_ref => {
          var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];
          if (key === 'forms') {
            this.forms = Forms.assign(value);
          } else if (key === 'popup') {
            this.popup = Popup.assign(value);
          } else if (key === 'webchat') {
            this.webchat = Webchat.assign(value);
          } else if (key === 'whatsappWidget') {
            this.whatsapp = WhatsApp.assign(value);
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
    get: function get() {
      return Locale.toString();
    },
    set: function set(locale) {
      Locale.identifier = locale;
    }
  }, {
    key: "endpoint",
    value: function endpoint(path) {
      return "".concat(this.apiRoot, "/").concat(path);
    }
  }, {
    key: "actionCableUrlForApiRoot",
    value: function actionCableUrlForApiRoot(apiRoot) {
      try {
        var url = new URL(apiRoot);
        var protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
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
Configuration.forms = Forms;
Configuration.popup = Popup;
Configuration.webchat = Webchat;
Configuration.whatsapp = WhatsApp;
export { Configuration };