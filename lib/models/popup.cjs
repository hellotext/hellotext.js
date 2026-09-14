"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Popup = void 0;
var _core = require("../core");
var _api = _interopRequireDefault(require("../api"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
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
    this.rendered = Promise.resolve(false);
  }
  async render() {
    if (!this.data.html) return false;
    const container = this.containerToAppendTo;
    if (!container) {
      console.warn(`Hellotext popup was not mounted because the container ${_core.Configuration.popup.container} was not found.`);
      return false;
    }
    container.appendChild(this.data.html);
    this.mounted = true;
    return true;
  }
  get containerToAppendTo() {
    try {
      return document.querySelector(_core.Configuration.popup.container);
    } catch (_) {
      return null;
    }
  }
}
exports.Popup = Popup;