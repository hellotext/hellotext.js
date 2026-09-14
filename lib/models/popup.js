import { Configuration } from '../core';
import API from '../api';
class Popup {
  static async load(id, options = {}) {
    const popup = new Popup({
      id,
      html: await API.popups.get(id)
    }, options);
    popup.rendered = popup.render();
    return popup;
  }
  constructor(data, {
    container = Configuration.popup.container,
    shouldMount = () => true
  } = {}) {
    this.data = data;
    this.container = container;
    this.mounted = false;
    this.rendered = Promise.resolve(false);
    this.shouldMount = shouldMount;
  }
  async render() {
    if (!this.data.html || !this.shouldMount()) return false;
    const container = this.containerToAppendTo;
    if (!container) {
      console.warn(`Hellotext popup was not mounted because the container ${this.container} was not found.`);
      return false;
    }
    if (!this.shouldMount()) return false;
    container.appendChild(this.data.html);
    this.mounted = true;
    if (!this.shouldMount()) this.unmount();
    return this.mounted;
  }

  /**
   * Remove this popup's server-rendered surface when a later initialization
   * replaces or disables it. Removing the root also disconnects Stimulus.
   *
   * @returns {void}
   */
  unmount() {
    this.data.html?.remove();
    this.mounted = false;
  }
  get containerToAppendTo() {
    try {
      return document.querySelector(this.container);
    } catch (_) {
      return null;
    }
  }
}
export { Popup };