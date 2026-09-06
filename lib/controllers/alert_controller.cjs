"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _stimulus = require("@hotwired/stimulus");
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _api = _interopRequireDefault(require("../api"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const DAY = 24 * 60 * 60 * 1000;
const dismissals = new Map();

/**
 * Displays Smart Alert sections and handles Push subscription and visitor dismissal.
 * Dismissal history is shared across this business's sections on the current origin.
 *
 * @property {import('../models/alert').Alert} alert - Owning SDK alert, assigned on connection.
 */
class _default extends _stimulus.Controller {
  static values = {
    sections: Array
  };
  static targets = ['title', 'description', 'primaryAction', 'secondaryAction'];

  /**
   * Initializes display state and binds the cross-tab storage handler.
   *
   * @returns {void}
   */
  initialize() {
    this.showRequest = 0;
    this.submitting = false;
    this.onStorage = this.onStorage.bind(this);
  }

  /**
   * Announces readiness and listens for dismissals in other tabs.
   *
   * @fires hellotext--alert:connected
   * @returns {void}
   */
  connect() {
    this.dispatch('connected', {
      detail: {
        controller: this
      }
    });
    window.addEventListener('storage', this.onStorage);
  }

  /**
   * Cancels pending display and removes the storage listener.
   *
   * @returns {void}
   */
  disconnect() {
    this.close();
    window.removeEventListener('storage', this.onStorage);
  }

  /**
   * Hides the alert when another tab records an active cooldown for this business.
   *
   * @param {StorageEvent} event - Browser storage change notification.
   * @returns {void}
   */
  onStorage(event) {
    if (event.key === this.storageKey && this.dismissal.dismissedUntil > Date.now()) {
      this.close();
    }
  }

  /**
   * Displays an enabled section after Push subscription restoration finishes.
   * Text overrides apply only to this call and are rendered as plain text.
   * Force bypasses the cooldown without changing dismissal history; section availability,
   * existing subscriptions, and denied notification permission still prevent display.
   *
   * @param {import('../../index').HellotextAlertSection} kind - Section to display.
   * @param {import('../../index').HellotextAlertShowOptions} [options={}] - Display overrides.
   * @param {boolean} [options.force=false] - Bypass the current dismissal cooldown.
   * @param {string} [options.title] - Override the section title.
   * @param {string} [options.description] - Override the section description.
   * @param {string} [options.primaryAction] - Override the Subscribe button label.
   * @param {string} [options.secondaryAction] - Override the Dismiss button label.
   * @fires alert:shown
   * @returns {Promise<boolean>} Whether the section was displayed.
   */
  async show(kind, {
    force = false,
    title,
    description,
    primaryAction,
    secondaryAction
  } = {}) {
    const request = ++this.showRequest;
    const section = this.sectionsValue.find(section => section.kind === kind);
    if (!section) {
      this.close();
      return false;
    }
    await this.alert.push.ready?.catch(() => {});
    if (request !== this.showRequest || this.alert.disposed || !this.element.isConnected) return false;
    if (this.unavailable || !force && this.dismissal.dismissedUntil > Date.now()) {
      this.close();
      return false;
    }
    this.titleTarget.textContent = title ?? section.title;
    this.descriptionTarget.textContent = description ?? section.description;
    this.primaryActionTarget.textContent = primaryAction ?? section.primary_action;
    this.secondaryActionTarget.textContent = secondaryAction ?? section.secondary_action;
    this.kind = kind;
    this.page = _hellotext.default.page.trackingData.page;
    this.element.hidden = false;
    this.record('shown');
    _hellotext.default.eventEmitter.dispatch('alert:shown', {
      kind
    });
    return true;
  }

  /**
   * Records a visitor dismissal from the secondary button and hides the alert.
   * The first dismissal starts a seven-day cooldown; later dismissals start thirty days.
   * Hidden alerts and pending subscriptions do not record another dismissal.
   *
   * @fires alert:dismissed
   * @returns {void}
   */
  hide() {
    if (this.element.hidden || this.submitting) return;
    const count = this.dismissal.dismissals + 1;
    const dismissal = {
      dismissals: count,
      dismissedUntil: Date.now() + (count === 1 ? 7 : 30) * DAY
    };
    dismissals.set(this.storageKey, dismissal);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(dismissal));
    } catch (_error) {
      // Keep the cooldown for this page when browser storage is unavailable.
    }
    this.close();
    this.record('dismissed');
    _hellotext.default.eventEmitter.dispatch('alert:dismissed', {
      kind: this.kind
    });
  }

  /**
   * Hides the alert and cancels pending display without recording a dismissal.
   *
   * @returns {void}
   */
  close() {
    this.showRequest += 1;
    this.element.hidden = true;
  }

  /**
   * Requests Push subscription directly from the primary button's click handler.
   * Disables both buttons while pending and hides once subscribed or permission is denied.
   * Subscription failures are reported through an event so the page can handle them.
   * Acceptance records the primary action, independently of the browser permission result.
   *
   * @fires alert:accepted
   * @fires hellotext--alert:error
   * @returns {Promise<import('../api/response').Response|void>} Server response when available.
   */
  async subscribe() {
    if (this.submitting || this.element.hidden) return;
    if (this.unavailable) return this.close();
    this.submitting = true;
    this.primaryActionTarget.disabled = true;
    this.secondaryActionTarget.disabled = true;
    this.element.setAttribute('aria-busy', 'true');
    try {
      this.record('accepted');
      _hellotext.default.eventEmitter.dispatch('alert:accepted', {
        kind: this.kind
      });

      // Call before any await so the browser permission prompt retains the click's activation.
      const response = await this.alert.push.subscribe();
      if (this.unavailable) this.close();
      if (response?.failed) this.dispatch('error', {
        detail: {
          response
        }
      });
      return response;
    } catch (error) {
      if (this.unavailable) this.close();
      this.dispatch('error', {
        detail: {
          error
        }
      });
    } finally {
      this.submitting = false;
      this.primaryActionTarget.disabled = false;
      this.secondaryActionTarget.disabled = false;
      this.element.removeAttribute('aria-busy');
    }
  }

  /**
   * Posts an interaction with the page snapshot captured when the alert was shown.
   * Does not delay display, dismissal, or native permission.
   * Recording failures leave the alert interaction unchanged.
   *
   * @private
   * @param {'shown'|'dismissed'|'accepted'} kind - Interaction to record.
   * @returns {Promise<void>}
   */
  async record(kind) {
    try {
      const response = await _api.default.pushAlerts.create({
        section: this.kind,
        kind,
        page: this.page
      });
      if (response.failed) console.warn('Hellotext Smart Alert submission failed:', response);
    } catch (error) {
      console.warn('Hellotext Smart Alert submission failed:', error);
    }
  }

  /**
   * Whether Push state or notification permission prevents showing this alert.
   *
   * @returns {boolean}
   */
  get unavailable() {
    return this.alert.push.disposed || this.alert.push.subscribed || typeof Notification === 'undefined' || Notification.permission === 'denied';
  }

  /**
   * Storage key shared by all sections for this business on the current origin.
   *
   * @returns {string}
   */
  get storageKey() {
    return `hellotext:alert:${this.alert.business.id}`;
  }

  /**
   * Reads valid saved dismissal history, falling back to page memory when storage fails.
   *
   * @returns {{dismissals: number, dismissedUntil: number}} Count and expiry in Unix milliseconds.
   */
  get dismissal() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey));
      if (Number.isSafeInteger(saved?.dismissals) && saved.dismissals > 0 && Number.isFinite(saved.dismissedUntil) && saved.dismissedUntil >= 0) {
        dismissals.set(this.storageKey, saved);
      }
    } catch (_error) {
      // Use the page's last known cooldown if storage is blocked or malformed.
    }
    return dismissals.get(this.storageKey) || {
      dismissals: 0,
      dismissedUntil: 0
    };
  }
}
exports.default = _default;