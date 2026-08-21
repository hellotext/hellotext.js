function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Configuration } from '../core';
import API from '../api';
import { Business } from './business';
var Webchat = /*#__PURE__*/function () {
  function Webchat(data) {
    _classCallCheck(this, Webchat);
    this.data = data;
    this.mounted = false;
    this.rendered = Promise.resolve(false);
  }
  return _createClass(Webchat, [{
    key: "render",
    value: function () {
      var _render = _asyncToGenerator(function* () {
        this.applyBehaviourOverride();
        if (!(yield this.stylesheetLoaded)) {
          console.warn('Hellotext webchat was not mounted because its stylesheet failed to load.');
          return false;
        }
        this.containerToAppendTo.appendChild(this.data.html);
        this.markCoexistingWidgets();
        this.mounted = true;
        return true;
      });
      function render() {
        return _render.apply(this, arguments);
      }
      return render;
    }()
  }, {
    key: "applyBehaviourOverride",
    value: function applyBehaviourOverride() {
      if (!Configuration.webchat.hasBehaviourOverride || !Configuration.webchat.behaviour) return;
      this.data.html.setAttribute('data-hellotext--webchat-behaviour-value', JSON.stringify(this.serializedBehaviour));
    }
  }, {
    key: "serializedBehaviour",
    get: function get() {
      var behaviour = Configuration.webchat.behaviour;
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
    get: function get() {
      return document.querySelector(Configuration.webchat.container);
    }
  }, {
    key: "stylesheetLoaded",
    get: function get() {
      return Business.waitForStylesheet(Business.latestStylesheet);
    }
  }, {
    key: "markCoexistingWidgets",
    value: function markCoexistingWidgets() {
      var webchat = this.data.html;
      var whatsapp = document.querySelector('.hellotext--whatsapp-widget');
      if (!webchat || !whatsapp) return;
      webchat.classList.add('hellotext--with-whatsapp-widget');
      whatsapp.classList.add('hellotext--with-webchat');
    }
  }], [{
    key: "load",
    value: function () {
      var _load = _asyncToGenerator(function* (id) {
        var webchat = new Webchat({
          id,
          html: yield API.webchats.get(id)
        });
        webchat.rendered = webchat.render();
        return webchat;
      });
      function load(_x) {
        return _load.apply(this, arguments);
      }
      return load;
    }()
  }]);
}();
export { Webchat };