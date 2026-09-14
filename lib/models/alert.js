/**
 * Mounts Smart Alert markup and coordinates access to its Stimulus controller.
 *
 * @property {Promise<boolean>} ready - Resolves when mounted and connected, or false if skipped.
 */
class Alert {
  /**
   * Prepares the server markup and starts mounting the alert.
   *
   * @param {{html: string}} data - Alert payload from the business response.
   * @param {import('./business').Business} business - Business context and stylesheet readiness.
   * @param {import('./push').Push} push - Push subscription manager used by the controller.
   */
  constructor(data, business, push) {
    this.business = business;
    this.push = push;
    this.disposed = false;
    this.showRequest = 0;
    this.controller = null;
    this.element = new DOMParser().parseFromString(data.html, 'text/html').querySelector('[data-controller~="hellotext--alert"]');
    this.connected = new Promise(resolve => {
      this.resolveConnected = resolve;
    });
    this.onConnect = this.onConnect.bind(this);
    this.ready = this.render();
  }

  /**
   * Links the connected controller to this alert and releases waiting display requests.
   *
   * @private
   * @param {CustomEvent} event - Connection event containing the Stimulus controller.
   * @returns {void}
   */
  onConnect(event) {
    this.controller = event.detail.controller;
    this.controller.alert = this;
    this.resolveConnected(true);
  }

  /**
   * Mounts the server markup after its stylesheet loads and waits for controller connection.
   * The markup retains its server-provided hidden state until a section is shown.
   *
   * @private
   * @returns {Promise<boolean>} Whether mounting and controller connection completed.
   */
  async render() {
    if (!this.element) return false;
    this.element.addEventListener('hellotext--alert:connected', this.onConnect);
    if (!(await this.business.stylesheetLoaded) || this.disposed) return false;
    document.body.appendChild(this.element);
    return this.connected;
  }

  /**
   * Waits for mounting and forwards the latest display request to the controller.
   * Later show, hide, or dispose calls cancel older requests that are still waiting.
   *
   * @param {import('../../index').HellotextAlertSection} kind - Enabled section to display.
   * @param {import('../../index').HellotextAlertShowOptions} [options={}] - Text and cooldown overrides.
   * @returns {Promise<boolean>} Whether the requested section was displayed.
   */
  async show(kind, options = {}) {
    const request = ++this.showRequest;
    if (!(await this.ready) || this.disposed || request !== this.showRequest) return false;
    return this.controller.show(kind, options);
  }

  /**
   * Hides the alert and cancels pending display without recording a visitor dismissal.
   *
   * @returns {void}
   */
  hide() {
    this.showRequest += 1;
    this.controller?.close();
  }

  /**
   * Cancels display, resolves any pending controller connection, and removes the alert.
   * Called when the SDK reinitializes so the previous business's alert cannot appear later.
   *
   * @returns {void}
   */
  dispose() {
    this.disposed = true;
    this.hide();
    this.resolveConnected(false);
    this.element?.removeEventListener('hellotext--alert:connected', this.onConnect);
    this.element?.remove();
  }
}
export { Alert };