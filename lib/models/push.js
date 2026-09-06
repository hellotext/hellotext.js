function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import API from '../api';
import { Configuration } from '../core';

/**
 * Manages browser Push subscriptions for Hellotext.
 *
 * @property {Promise<void>|null} ready - Initialization promise, available after initialize().
 */
var Push = /*#__PURE__*/function () {
  /**
   * @param {Object} data - Push configuration from the business response.
   * @param {String} data.public_key - Base64url-encoded VAPID public key.
   */
  function Push(data) {
    _classCallCheck(this, Push);
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
    value: function () {
      var _restoreSubscription = _asyncToGenerator(function* () {
        var registration = yield this.getRegistration();
        var subscription = yield registration.pushManager.getSubscription();
        if (this.disposed || this.unsubscribePromise || !subscription || !this.owns(subscription)) {
          return;
        }
        this.subscription = subscription;
        yield this.sync();
      });
      function restoreSubscription() {
        return _restoreSubscription.apply(this, arguments);
      }
      return restoreSubscription;
    }()
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
      var permission = Notification.permission === 'default' ? Notification.requestPermission() : Promise.resolve(Notification.permission);
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
    value: function () {
      var _createSubscription = _asyncToGenerator(function* (permission) {
        if ((yield permission) !== 'granted') throw new Error('Push permission was not granted');
        var registration = yield this.getRegistration();
        if (this.disposed) return;
        var subscription = yield registration.pushManager.getSubscription();
        if (this.disposed) return;
        if (subscription && !this.owns(subscription)) {
          throw new Error('The existing Push subscription belongs to a different application');
        }
        subscription || (subscription = yield registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.applicationServerKey
        }));
        if (this.disposed) return;
        this.subscription = subscription;
        return this.sync();
      });
      function createSubscription(_x) {
        return _createSubscription.apply(this, arguments);
      }
      return createSubscription;
    }()
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
    value: function () {
      var _removeSubscription = _asyncToGenerator(function* () {
        var _this$ready, _this$subscribePromis, _this$syncPromise;
        yield (_this$ready = this.ready) === null || _this$ready === void 0 ? void 0 : _this$ready.catch(() => {});
        yield (_this$subscribePromis = this.subscribePromise) === null || _this$subscribePromis === void 0 ? void 0 : _this$subscribePromis.catch(() => {});
        yield (_this$syncPromise = this.syncPromise) === null || _this$syncPromise === void 0 ? void 0 : _this$syncPromise.catch(() => {});
        var registration = yield this.getRegistration();
        var subscription = (yield registration.pushManager.getSubscription()) || this.subscription;
        if (this.disposed) return;
        if (!subscription) return null;
        if (!this.owns(subscription)) {
          throw new Error('The existing Push subscription belongs to a different application');
        }
        this.subscription = subscription;
        var response = yield API.pushIdentities.destroy({
          subscription: subscription.toJSON()
        });
        if (response.failed) return response;
        if (this.disposed) return;
        yield subscription.unsubscribe();
        this.subscription = null;
        this.clearRetryTimeout();
        return response;
      });
      function removeSubscription() {
        return _removeSubscription.apply(this, arguments);
      }
      return removeSubscription;
    }()
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
    value: function () {
      var _registerIdentity = _asyncToGenerator(function* () {
        try {
          var response = yield API.pushIdentities.create(_objectSpread({
            subscription: this.subscription.toJSON()
          }, this.channelId ? {
            channel_id: this.channelId
          } : {}));
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
      });
      function registerIdentity() {
        return _registerIdentity.apply(this, arguments);
      }
      return registerIdentity;
    }()
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
    get: function get() {
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
    get: function get() {
      var base64 = this.publicKey.replace(/-/g, '+').replace(/_/g, '/');
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
      var key = (_subscription$options = subscription.options) === null || _subscription$options === void 0 ? void 0 : _subscription$options.applicationServerKey;
      if (!key) return false;
      var actual = new Uint8Array(key);
      var expected = this.applicationServerKey;
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
    value: function () {
      var _loadRegistration = _asyncToGenerator(function* () {
        if (this.serviceWorkerUrl) {
          var registration = yield navigator.serviceWorker.register(this.serviceWorkerUrl);
          if (registration.active && !registration.installing && !registration.waiting) {
            // A returning visitor may have an older worker that does not include our Push handlers.
            // Calling register() with the same URL can return that existing registration without
            // checking whether the script served at that URL has changed since their last visit.
            //
            // If no replacement is already installing or waiting, explicitly check for an update
            // before treating the active worker as ready. Awaiting update() completes the update
            // check, but does not wait for a replacement worker to activate. The code below selects
            // that replacement, if one was found, and waits for its activation before subscribing.
            yield registration.update();
          }
          var worker = registration.installing || registration.waiting || registration.active;
          if ((worker === null || worker === void 0 ? void 0 : worker.state) === 'activated') return registration;
          return new Promise((resolve, reject) => {
            var timeout = setTimeout(() => finish(new Error('Push service worker did not become active')), 10000);
            var finish = error => {
              clearTimeout(timeout);
              worker === null || worker === void 0 ? void 0 : worker.removeEventListener('statechange', changed);
              error ? reject(error) : resolve(registration);
            };
            var changed = () => {
              if ((worker === null || worker === void 0 ? void 0 : worker.state) === 'activated') finish();
              if ((worker === null || worker === void 0 ? void 0 : worker.state) === 'redundant') finish(new Error('Push service worker installation failed'));
            };
            worker === null || worker === void 0 ? void 0 : worker.addEventListener('statechange', changed);
            changed();
          });
        }

        // Reuse the service worker already registered for this page.
        return new Promise((resolve, reject) => {
          var timeout = setTimeout(() => reject(new Error('Push service worker is not available')), 10000);
          navigator.serviceWorker.ready.then(registration => {
            clearTimeout(timeout);
            resolve(registration);
          }, error => {
            clearTimeout(timeout);
            reject(error);
          });
        });
      });
      function loadRegistration() {
        return _loadRegistration.apply(this, arguments);
      }
      return loadRegistration;
    }()
    /**
     * Whether the current page provides the browser APIs required for Push.
     *
     * @returns {Boolean}
     */
  }], [{
    key: "supported",
    get: function get() {
      return typeof window !== 'undefined' && window.isSecureContext === true && typeof navigator !== 'undefined' && 'serviceWorker' in navigator && typeof PushManager !== 'undefined' && typeof Notification !== 'undefined';
    }
  }]);
  return Push;
}();
export { Push };