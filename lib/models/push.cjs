"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Push = void 0;
var _api = _interopRequireDefault(require("../api"));
var _core = require("../core");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * Manages browser Push subscriptions for Hellotext.
 *
 * @property {Promise<void>|null} ready - Initialization promise, available after initialize().
 */
let Push = /*#__PURE__*/function () {
  /**
   * @param {Object} data - Push configuration from the business response.
   * @param {String} data.public_key - Base64url-encoded VAPID public key.
   */
  function Push(data) {
    _classCallCheck(this, Push);
    this.publicKey = data.public_key;
    this.serviceWorkerUrl = _core.Configuration.push.serviceWorkerUrl;
    this.channelId = _core.Configuration.push.channelId;
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
  _createClass(Push, [{
    key: "initialize",
    value: function initialize() {
      this.ready = this.restoreSubscription();
      return this.ready;
    }

    /**
     * Registers an existing Hellotext subscription with the server without prompting.
     *
     * @private
     * @returns {Promise<void>}
     */
  }, {
    key: "restoreSubscription",
    value: async function restoreSubscription() {
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
  }, {
    key: "subscribe",
    value: function subscribe() {
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
  }, {
    key: "createSubscription",
    value: async function createSubscription(permission) {
      if ((await permission) !== 'granted') throw new Error('Push permission was not granted');
      const registration = await this.getRegistration();
      if (this.disposed) return;
      let subscription = await registration.pushManager.getSubscription();
      if (this.disposed) return;
      if (subscription && !this.owns(subscription)) {
        throw new Error('The existing Push subscription belongs to a different application');
      }
      subscription || (subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.applicationServerKey
      }));
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
  }, {
    key: "unsubscribe",
    value: function unsubscribe() {
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
  }, {
    key: "removeSubscription",
    value: async function removeSubscription() {
      var _this$ready, _this$subscribePromis, _this$syncPromise;
      await ((_this$ready = this.ready) === null || _this$ready === void 0 ? void 0 : _this$ready.catch(() => {}));
      await ((_this$subscribePromis = this.subscribePromise) === null || _this$subscribePromis === void 0 ? void 0 : _this$subscribePromis.catch(() => {}));
      await ((_this$syncPromise = this.syncPromise) === null || _this$syncPromise === void 0 ? void 0 : _this$syncPromise.catch(() => {}));
      const registration = await this.getRegistration();
      const subscription = (await registration.pushManager.getSubscription()) || this.subscription;
      if (this.disposed) return;
      if (!subscription) return null;
      if (!this.owns(subscription)) {
        throw new Error('The existing Push subscription belongs to a different application');
      }
      this.subscription = subscription;
      const response = await _api.default.pushIdentities.destroy({
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
  }, {
    key: "sync",
    value: function sync() {
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
  }, {
    key: "registerIdentity",
    value: async function registerIdentity() {
      try {
        const response = await _api.default.pushIdentities.create({
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
  }, {
    key: "scheduleRetry",
    value: function scheduleRetry() {
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
  }, {
    key: "clearRetryTimeout",
    value: function clearRetryTimeout() {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }

    /**
     * Stops registration retries and prevents further use of this instance.
     *
     * @returns {void}
     */
  }, {
    key: "dispose",
    value: function dispose() {
      this.disposed = true;
      this.clearRetryTimeout();
    }

    /**
     * Whether this instance has a browser subscription, regardless of server registration.
     *
     * @returns {Boolean}
     */
  }, {
    key: "subscribed",
    get: function () {
      return !!this.subscription;
    }

    /**
     * Decodes the public key into the bytes expected by PushManager.subscribe().
     *
     * @private
     * @returns {Uint8Array}
     */
  }, {
    key: "applicationServerKey",
    get: function () {
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
  }, {
    key: "owns",
    value: function owns(subscription) {
      var _subscription$options;
      const key = (_subscription$options = subscription.options) === null || _subscription$options === void 0 ? void 0 : _subscription$options.applicationServerKey;
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
  }, {
    key: "getRegistration",
    value: function getRegistration() {
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
  }, {
    key: "loadRegistration",
    value: async function loadRegistration() {
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
        if ((worker === null || worker === void 0 ? void 0 : worker.state) === 'activated') return registration;
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => finish(new Error('Push service worker did not become active')), 10000);
          const finish = error => {
            clearTimeout(timeout);
            worker === null || worker === void 0 ? void 0 : worker.removeEventListener('statechange', changed);
            error ? reject(error) : resolve(registration);
          };
          const changed = () => {
            if ((worker === null || worker === void 0 ? void 0 : worker.state) === 'activated') finish();
            if ((worker === null || worker === void 0 ? void 0 : worker.state) === 'redundant') finish(new Error('Push service worker installation failed'));
          };
          worker === null || worker === void 0 ? void 0 : worker.addEventListener('statechange', changed);
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
  }], [{
    key: "supported",
    get: function () {
      return typeof window !== 'undefined' && window.isSecureContext === true && typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof PushManager !== 'undefined' && typeof Notification !== 'undefined';
    }
  }]);
  return Push;
}();
exports.Push = Push;