"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Webchat = void 0;
var _core = require("../core");
var _api = _interopRequireDefault(require("../api"));
var _business = require("./business");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let Webchat = exports.Webchat = /*#__PURE__*/function () {
  function Webchat(data) {
    _classCallCheck(this, Webchat);
    this.data = data;
    this.mounted = false;
    this.unmounted = false;
    this.rendered = Promise.resolve(false);
  }
  return _createClass(Webchat, [{
    key: "render",
    value: async function render() {
      if (!this.data.html || this.unmounted) return false;
      this.applyBehaviourOverride();
      if (!(await this.stylesheetLoaded) || this.unmounted) {
        if (this.unmounted) return false;
        console.warn('Hellotext webchat was not mounted because its stylesheet failed to load.');
        return false;
      }
      this.containerToAppendTo.appendChild(this.data.html);
      this.markCoexistingWidgets();
      this.mounted = true;
      return true;
    }
  }, {
    key: "unmount",
    value: function unmount() {
      var _this$data$html, _document$querySelect;
      this.unmounted = true;
      (_this$data$html = this.data.html) === null || _this$data$html === void 0 || _this$data$html.remove();
      (_document$querySelect = document.querySelector('.hellotext--whatsapp-widget')) === null || _document$querySelect === void 0 || _document$querySelect.classList.remove('hellotext--with-webchat');
      this.mounted = false;
    }
  }, {
    key: "applyBehaviourOverride",
    value: function applyBehaviourOverride() {
      if (!_core.Configuration.webchat.hasBehaviourOverride || !_core.Configuration.webchat.behaviour) return;
      this.data.html.setAttribute('data-hellotext--webchat-behaviour-value', JSON.stringify(this.serializedBehaviour));
    }
  }, {
    key: "serializedBehaviour",
    get: function () {
      const behaviour = _core.Configuration.webchat.behaviour;
      return {
        trigger: this.serializeTrigger(behaviour.trigger),
        delay_seconds: behaviour.delaySeconds,
        first_visit_only: behaviour.firstVisitOnly,
        once_per_session: behaviour.oncePerSession
      };
    }
  }, {
    key: "serializeTrigger",
    value: function serializeTrigger(trigger) {
      if (trigger === 'onLoad') return 'on_load';
      if (trigger === 'onClick') return 'on_click';
      return trigger;
    }
  }, {
    key: "containerToAppendTo",
    get: function () {
      return document.querySelector(_core.Configuration.webchat.container);
    }
  }, {
    key: "stylesheetLoaded",
    get: function () {
      return _business.Business.waitForStylesheet(_business.Business.latestStylesheet);
    }
  }, {
    key: "markCoexistingWidgets",
    value: function markCoexistingWidgets() {
      const webchat = this.data.html;
      const whatsapp = document.querySelector('.hellotext--whatsapp-widget');
      if (!webchat || !whatsapp) return;
      webchat.classList.add('hellotext--with-whatsapp-widget');
      whatsapp.classList.add('hellotext--with-webchat');
    }
  }], [{
    key: "load",
    value: async function load(id) {
      const webchat = new Webchat({
        id,
        html: await _api.default.webchats.get(id)
      });
      webchat.rendered = webchat.render();
      return webchat;
    }
  }]);
}();