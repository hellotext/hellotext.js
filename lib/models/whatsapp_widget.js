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
var WhatsAppWidget = /*#__PURE__*/function () {
  function WhatsAppWidget(data) {
    _classCallCheck(this, WhatsAppWidget);
    this.data = data;
    this.mounted = false;
    this.unmounted = false;
    this.rendered = Promise.resolve(false);
  }
  return _createClass(WhatsAppWidget, [{
    key: "render",
    value: function () {
      var _render = _asyncToGenerator(function* () {
        if (!this.data.html || this.unmounted) return false;
        var container = this.containerToAppendTo;
        if (!container) {
          console.warn("Hellotext WhatsApp widget was not mounted because the container ".concat(Configuration.whatsapp.container, " was not found."));
          return false;
        }
        if (!(yield this.stylesheetLoaded) || this.unmounted) {
          if (this.unmounted) return false;
          console.warn('Hellotext WhatsApp widget was not mounted because its stylesheet failed to load.');
          return false;
        }
        container.appendChild(this.data.html);
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
    key: "unmount",
    value: function unmount() {
      var _this$data$html, _document$querySelect;
      this.unmounted = true;
      (_this$data$html = this.data.html) === null || _this$data$html === void 0 || _this$data$html.remove();
      (_document$querySelect = document.querySelector('.hellotext--webchat:not(.hellotext--whatsapp-widget)')) === null || _document$querySelect === void 0 || _document$querySelect.classList.remove('hellotext--with-whatsapp-widget');
      this.mounted = false;
    }
  }, {
    key: "containerToAppendTo",
    get: function get() {
      try {
        return document.querySelector(Configuration.whatsapp.container);
      } catch (_) {
        return null;
      }
    }
  }, {
    key: "stylesheetLoaded",
    get: function get() {
      return Business.waitForStylesheet(Business.latestStylesheet);
    }
  }, {
    key: "markCoexistingWidgets",
    value: function markCoexistingWidgets() {
      var webchat = document.querySelector('.hellotext--webchat:not(.hellotext--whatsapp-widget)');
      var whatsapp = this.data.html;
      if (!webchat || !whatsapp) return;
      webchat.classList.add('hellotext--with-whatsapp-widget');
      whatsapp.classList.add('hellotext--with-webchat');
    }
  }], [{
    key: "load",
    value: function () {
      var _load = _asyncToGenerator(function* (id) {
        var widget = new WhatsAppWidget({
          id,
          html: yield API.whatsappWidgets.get(id)
        });
        widget.rendered = widget.render();
        return widget;
      });
      function load(_x) {
        return _load.apply(this, arguments);
      }
      return load;
    }()
  }]);
}();
export { WhatsAppWidget };