"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Webchat = void 0;
var _core = require("../core");
var _api = _interopRequireDefault(require("../api"));
var _business = require("./business");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let Webchat = /*#__PURE__*/function () {
  function Webchat(data) {
    _classCallCheck(this, Webchat);
    this.data = data;
    this.mounted = false;
    this.rendered = Promise.resolve(false);
  }
  _createClass(Webchat, [{
    key: "render",
    value: async function render() {
      this.applyBehaviourOverride();
      if (!(await this.stylesheetLoaded)) {
        console.warn('Hellotext webchat was not mounted because its stylesheet failed to load.');
        return false;
      }
      this.containerToAppendTo.appendChild(this.data.html);
      this.markCoexistingWidgets();
      this.mounted = true;
      return true;
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
  return Webchat;
}();
exports.Webchat = Webchat;