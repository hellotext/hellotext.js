"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Popup = void 0;
var _core = require("../core");
var _api = _interopRequireDefault(require("../api"));
var _business = require("./business");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let Popup = exports.Popup = /*#__PURE__*/function () {
  function Popup(data) {
    _classCallCheck(this, Popup);
    this.data = data;
    this.mounted = false;
    this.unmounted = false;
    this.rendered = Promise.resolve(false);
  }
  return _createClass(Popup, [{
    key: "render",
    value: async function render() {
      if (!this.data.html || this.unmounted) return false;
      const container = this.containerToAppendTo;
      if (!container) {
        console.warn(`Hellotext popup was not mounted because the container ${_core.Configuration.popup.container} was not found.`);
        return false;
      }
      if (!(await this.stylesheetLoaded) || this.unmounted) {
        if (this.unmounted) return false;
        console.warn('Hellotext popup was not mounted because its stylesheet failed to load.');
        return false;
      }
      container.appendChild(this.data.html);
      this.mounted = true;
      return true;
    }
  }, {
    key: "unmount",
    value: function unmount() {
      var _this$data$html;
      this.unmounted = true;
      (_this$data$html = this.data.html) === null || _this$data$html === void 0 || _this$data$html.remove();
      this.mounted = false;
    }
  }, {
    key: "containerToAppendTo",
    get: function () {
      try {
        return document.querySelector(_core.Configuration.popup.container);
      } catch (_) {
        return null;
      }
    }
  }, {
    key: "stylesheetLoaded",
    get: function () {
      return _business.Business.waitForStylesheet(_business.Business.latestStylesheet);
    }
  }], [{
    key: "load",
    value: async function load(id) {
      const popup = new Popup({
        id,
        html: await _api.default.popups.get(id)
      });
      popup.rendered = popup.render();
      return popup;
    }
  }]);
}();