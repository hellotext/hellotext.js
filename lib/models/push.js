import API from '../api';
import { Configuration } from '../core';

/**
 * Manages browser Push subscriptions for Hellotext.
 *
 * @property {Promise<void>|null} ready - Initialization promise, available after initialize().
 */
class Push {
  /**
   * @param {Object} data - Push configuration from the business response.
   * @param {String} data.public_key - Base64url-encoded VAPID public key.
   */
  constructor(data) {
    this.publicKey = data.public_key;
    this.serviceWorkerUrl = Configuration.push.serviceWorkerUrl;
    this.channelId = Configuration.push.channelId;
    this.ready = null;
    this.registrationPromise = null;
    this.subscribePromise = null;
    this.unsubscribePromise = null;
    this.syncPromise = null;
    this.subscription = null;
    this.retryTimeout = null;
    this.retryAttempts = 0;
    this.disposed = false;
  }

  /**
   * Prepares the service worker and restores an existing subscription.
   *
   * @returns {Promise<void>}
   */
  initialize() {
    this.ready = this.restoreSubscription();
    return this.ready;
  }

  /**
   * Registers an existing Hellotext subscription with the server without prompting.
   *
   * @private
   * @returns {Promise<void>}
   */
  async restoreSubscription() {
    const registration = await this.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    if (this.disposed || this.unsubscribePromise || !subscription || !this.owns(subscription)) {
      return;
    }
    this.subscription = subscription;
    await this.sync();
  }

  /**
   * Creates or reuses a Push subscription. Call from a user click handler.
   * Concurrent calls share the same pending request.
   *
   * @returns {Promise<import('../api/response').Response|void>} Server registration response,
   *   or no value when disposed.
   *   Rejects when permission is denied or a browser or network operation fails.
   */
  subscribe() {
    if (this.disposed) return Promise.resolve();
    if (this.unsubscribePromise) return Promise.reject(new Error('Push unsubscribe is in progress'));
    if (this.subscribePromise) return this.subscribePromise;

    // Request permission before awaiting worker readiness to retain the click's user activation.
    const permission = Notification.permission === 'default' ? Notification.requestPermission() : Promise.resolve(Notification.permission);
    this.subscribePromise = this.createSubscription(permission).finally(() => {
      this.subscribePromise = null;
    });
    return this.subscribePromise;
  }

  /**
   * Waits for permission and worker readiness, then subscribes and registers with Hellotext.
   *
   * @private
   * @param {Promise<NotificationPermission>} permission - Pending notification permission result.
   * @returns {Promise<import('../api/response').Response|void>}
   */
  async createSubscription(permission) {
    if ((await permission) !== 'granted') throw new Error('Push permission was not granted');
    const registration = await this.getRegistration();
    if (this.disposed) return;
    let subscription = await registration.pushManager.getSubscription();
    if (this.disposed) return;
    if (subscription && !this.owns(subscription)) {
      throw new Error('The existing Push subscription belongs to a different application');
    }
    subscription ||= await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.applicationServerKey
    });
    if (this.disposed) return;
    this.subscription = subscription;
    return this.sync();
  }

  /**
   * Disables the server identity and removes the browser subscription.
   * Keeps the subscription when the server request fails so the caller can retry.
   *
   * @returns {Promise<import('../api/response').Response|null|void>} Server response, null when
   *   no subscription exists, or no value when disposed. Rejects when a browser or network
   *   operation fails.
   */
  unsubscribe() {
    if (this.disposed) return Promise.resolve();
    if (this.unsubscribePromise) return this.unsubscribePromise;
    this.clearRetryTimeout();
    this.unsubscribePromise = this.removeSubscription().finally(() => {
      this.unsubscribePromise = null;
    });
    return this.unsubscribePromise;
  }

  /**
   * Finishes pending registration before disabling and removing the subscription.
   *
   * @private
   * @returns {Promise<import('../api/response').Response|null|void>}
   */
  async removeSubscription() {
    await this.ready?.catch(() => {});
    await this.subscribePromise?.catch(() => {});
    await this.syncPromise?.catch(() => {});
    const registration = await this.getRegistration();
    const subscription = (await registration.pushManager.getSubscription()) || this.subscription;
    if (this.disposed) return;
    if (!subscription) return null;
    if (!this.owns(subscription)) {
      throw new Error('The existing Push subscription belongs to a different application');
    }
    this.subscription = subscription;
    const response = await API.pushIdentities.destroy({
      subscription: subscription.toJSON()
    });
    if (response.failed) return response;
    if (this.disposed) return;
    await subscription.unsubscribe();
    this.subscription = null;
    this.clearRetryTimeout();
    return response;
  }

  /**
   * Registers the current subscription, sharing any request already in progress.
   *
   * @private
   * @returns {Promise<import('../api/response').Response|void>}
   */
  sync() {
    if (this.disposed) return Promise.resolve();
    if (this.syncPromise) return this.syncPromise;
    this.clearRetryTimeout();
    this.syncPromise = this.registerIdentity().finally(() => {
      this.syncPromise = null;
    });
    return this.syncPromise;
  }

  /**
   * Sends the subscription to Hellotext and schedules a retry on failure.
   *
   * @private
   * @returns {Promise<import('../api/response').Response>}
   */
  async registerIdentity() {
    try {
      const response = await API.pushIdentities.create({
        subscription: this.subscription.toJSON(),
        ...(this.channelId ? {
          channel_id: this.channelId
        } : {})
      });
      if (response.succeeded) {
        this.retryAttempts = 0;
      } else {
        this.scheduleRetry();
      }
      return response;
    } catch (error) {
      this.scheduleRetry();
      throw error;
    }
  }

  /**
   * Schedules up to three registration retries with increasing delays.
   *
   * @private
   * @returns {void}
   */
  scheduleRetry() {
    if (this.disposed || this.unsubscribePromise || this.retryTimeout || this.retryAttempts >= 3) return;
    this.retryTimeout = setTimeout(() => {
      this.retryTimeout = null;
      this.sync().catch(() => {});
    }, 1000 * 2 ** this.retryAttempts);
    this.retryAttempts += 1;
  }

  /**
   * Cancels a pending registration retry.
   *
   * @private
   * @returns {void}
   */
  clearRetryTimeout() {
    clearTimeout(this.retryTimeout);
    this.retryTimeout = null;
  }

  /**
   * Stops registration retries and prevents further use of this instance.
   *
   * @returns {void}
   */
  dispose() {
    this.disposed = true;
    this.clearRetryTimeout();
  }

  /**
   * Whether this instance has a browser subscription, regardless of server registration.
   *
   * @returns {Boolean}
   */
  get subscribed() {
    return !!this.subscription;
  }

  /**
   * Decodes the public key into the bytes expected by PushManager.subscribe().
   *
   * @private
   * @returns {Uint8Array}
   */
  get applicationServerKey() {
    const base64 = this.publicKey.replace(/-/g, '+').replace(/_/g, '/');
    return Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), char => char.charCodeAt(0));
  }

  /**
   * Checks whether a subscription uses this instance's public key.
   *
   * @private
   * @param {PushSubscription} subscription - Browser subscription to check.
   * @returns {Boolean}
   */
  owns(subscription) {
    const key = subscription.options?.applicationServerKey;
    if (!key) return false;
    const actual = new Uint8Array(key);
    const expected = this.applicationServerKey;
    return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
  }

  /**
   * Gets the worker registration, sharing any pending lookup.
   * Failed lookups can be retried by a later call.
   *
   * @private
   * @returns {Promise<ServiceWorkerRegistration>}
   */
  getRegistration() {
    if (!this.registrationPromise) {
      this.registrationPromise = this.loadRegistration().catch(error => {
        this.registrationPromise = null;
        throw error;
      });
    }
    return this.registrationPromise;
  }

  /**
   * Registers the configured worker or waits for the page's existing registration.
   *
   * @private
   * @returns {Promise<ServiceWorkerRegistration>} An active registration.
   *   Rejects if registration fails or the worker readiness wait times out.
   */
  async loadRegistration() {
    if (this.serviceWorkerUrl) {
      const registration = await navigator.serviceWorker.register(this.serviceWorkerUrl);
      if (registration.active && !registration.installing && !registration.waiting) {
        // A returning visitor may have an older worker that does not include our Push handlers.
        // Calling register() with the same URL can return that existing registration without
        // checking whether the script served at that URL has changed since their last visit.
        //
        // If no replacement is already installing or waiting, explicitly check for an update
        // before treating the active worker as ready. Awaiting update() completes the update
        // check, but does not wait for a replacement worker to activate. The code below selects
        // that replacement, if one was found, and waits for its activation before subscribing.
        await registration.update();
      }
      const worker = registration.installing || registration.waiting || registration.active;
      if (worker?.state === 'activated') return registration;
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => finish(new Error('Push service worker did not become active')), 10000);
        const finish = error => {
          clearTimeout(timeout);
          worker?.removeEventListener('statechange', changed);
          error ? reject(error) : resolve(registration);
        };
        const changed = () => {
          if (worker?.state === 'activated') finish();
          if (worker?.state === 'redundant') finish(new Error('Push service worker installation failed'));
        };
        worker?.addEventListener('statechange', changed);
        changed();
      });
    }

    // Reuse the service worker already registered for this page.
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Push service worker is not available')), 10000);
      navigator.serviceWorker.ready.then(registration => {
        clearTimeout(timeout);
        resolve(registration);
      }, error => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * Whether the current page provides the browser APIs required for Push.
   *
   * @returns {Boolean}
   */
  static get supported() {
    return typeof window !== 'undefined' && window.isSecureContext === true && typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof PushManager !== 'undefined' && typeof Notification !== 'undefined';
  }
}
export { Push };