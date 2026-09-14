"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Popup = void 0;
var _core = require("../core");
var _api = _interopRequireDefault(require("../api"));
var _business = require("./business");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class Popup {
  static async load(id) {
    const popup = new Popup({
      id,
      html: await _api.default.popups.get(id)
    });
    popup.rendered = popup.render();
    return popup;
  }
  constructor(data) {
    this.data = data;
    this.mounted = false;
    this.unmounted = false;
    this.rendered = Promise.resolve(false);
  }
  async render() {
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
  unmount() {
    this.unmounted = true;
    this.data.html?.remove();
    this.mounted = false;
  }
  get containerToAppendTo() {
    try {
      return document.querySelector(_core.Configuration.popup.container);
    } catch (_) {
      return null;
    }
  }
  get stylesheetLoaded() {
    return _business.Business.waitForStylesheet(_business.Business.latestStylesheet);
  }
}
exports.Popup = Popup;