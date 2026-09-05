"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Business = void 0;
var _locales = _interopRequireDefault(require("../locales"));
var _businesses = _interopRequireDefault(require("../api/businesses"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
const stylesheetAttribute = 'data-hellotext-stylesheet';
const stylesheetLoadTimeout = 10000;

/**
 * @typedef {Object} BusinessCountry
 * @property {String} [code] - ISO country code configured for the business.
 * @property {String} [prefix] - Phone country prefix configured for the business.
 */

/**
 * @typedef {Object} BusinessWebchat
 * @property {String} [id] - Dashboard webchat id configured for the business.
 * @property {Object} [appearance] - Dashboard appearance defaults for the webchat.
 * @property {Object} [whatsapp] - Dashboard WhatsApp handoff defaults for the webchat.
 */

/**
 * Public business metadata returned by `public/businesses/:id`.
 *
 * @typedef {Object} BusinessData
 * @property {String} [id] - Public business id.
 * @property {BusinessCountry|String} [country] - Business country metadata.
 * @property {Object} [features] - Feature flags enabled for the business.
 * @property {String} [locale] - Default dashboard locale for the business.
 * @property {String} [style_url] - Stylesheet URL to inject for dashboard-managed surfaces.
 * @property {{id: String}|null} [popup] - Dashboard popup defaults.
 * @property {BusinessWebchat|null} [webchat] - Dashboard webchat defaults.
 * @property {{id: String}|null} [whatsapp] - Dashboard WhatsApp widget defaults.
 * @property {String|Array<String>} [whitelist] - Domain whitelist configuration.
 * @property {String} [subscription] - Current business subscription tier.
 */

/**
 * Public business context used by the SDK for tracking, forms, and webchat defaults.
 */
let Business = /*#__PURE__*/function () {
  /**
   * @param {String} id - Public business id.
   */
  function Business(id) {
    _classCallCheck(this, Business);
    this.id = id;
    this.data = null;
    this.stylesheet = null;
    this.stylesheetLoaded = Promise.resolve(false);
  }

  /**
   * Hydrates business metadata from the public business endpoint.
   *
   * Fetch failures return `null` so tracking initialization can continue even
   * when dashboard-driven webchat defaults are unavailable.
   *
   * @returns {Promise<BusinessData|null>}
   */
  _createClass(Business, [{
    key: "hydrate",
    value: async function hydrate() {
      try {
        const response = await _businesses.default.get(this.id);
        if (response.ok === false) {
          return null;
        }
        const business = await response.json();
        if (!business) {
          return null;
        }
        this.setData(business);
        if (business.locale) {
          this.setLocale(business.locale);
        }
        return business;
      } catch (_error) {
        return null;
      }
    }

    /**
     * @param {BusinessData} data
     * @returns {void}
     */
  }, {
    key: "setData",
    value: function setData(data) {
      this.data = data;
      if (typeof document !== 'undefined' && data.style_url) {
        this.stylesheet = this.constructor.ensureStylesheet(data.style_url);
        this.stylesheetLoaded = this.constructor.waitForStylesheet(this.stylesheet);
      } else {
        this.stylesheet = null;
        this.stylesheetLoaded = Promise.resolve(false);
      }
    }
  }, {
    key: "subscription",
    get: function () {
      return this.data.subscription;
    }
  }, {
    key: "country",
    get: function () {
      return this.data.country;
    }
  }, {
    key: "enabledWhitelist",
    get: function () {
      return this.data.whitelist !== 'disabled';
    }

    /**
     * @param {String} locale
     * @returns {void}
     */
  }, {
    key: "setLocale",
    value: function setLocale(locale) {
      if (!_locales.default[locale]) {
        return console.warn(`Locale ${locale} not found`);
      }
      if (!this.data) {
        this.data = {};
      }
      this.data.locale = locale;
    }
  }, {
    key: "locale",
    get: function () {
      return _locales.default[this.data.locale];
    }
  }, {
    key: "features",
    get: function () {
      return this.data.features;
    }
  }], [{
    key: "stylesheetSelector",
    get: function () {
      return `link[rel="stylesheet"][${stylesheetAttribute}]`;
    }
  }, {
    key: "ensureStylesheet",
    value: function ensureStylesheet(styleUrl) {
      const href = this.normalizedStylesheetUrl(styleUrl);
      const existingLink = this.stylesheetLinks.find(link => link.href === href);
      if (existingLink) {
        existingLink.setAttribute(stylesheetAttribute, 'true');
        return existingLink;
      }
      const linkTag = document.createElement('link');
      linkTag.rel = 'stylesheet';
      linkTag.href = styleUrl;
      linkTag.setAttribute(stylesheetAttribute, 'true');
      this.waitForStylesheet(linkTag);
      document.head.append(linkTag);
      return linkTag;
    }
  }, {
    key: "stylesheetLinks",
    get: function () {
      if (typeof document === 'undefined') return [];
      return Array.from(document.querySelectorAll(this.stylesheetSelector));
    }
  }, {
    key: "latestStylesheet",
    get: function () {
      return this.stylesheetLinks[this.stylesheetLinks.length - 1];
    }
  }, {
    key: "normalizedStylesheetUrl",
    value: function normalizedStylesheetUrl(styleUrl) {
      try {
        return new URL(styleUrl, document.baseURI).href;
      } catch (_error) {
        return styleUrl;
      }
    }
  }, {
    key: "waitForStylesheet",
    value: function waitForStylesheet(linkTag) {
      if (!linkTag) return Promise.resolve(false);
      if (this.stylesheetIsLoaded(linkTag)) return Promise.resolve(true);
      if (linkTag.dataset.hellotextStylesheetLoaded === 'false') return Promise.resolve(false);
      if (linkTag._hellotextStylesheetLoaded) return linkTag._hellotextStylesheetLoaded;
      linkTag._hellotextStylesheetLoaded = new Promise(resolve => {
        let timeout;
        const finish = loaded => {
          clearTimeout(timeout);
          linkTag.removeEventListener('load', handleLoad);
          linkTag.removeEventListener('error', handleError);
          linkTag.dataset.hellotextStylesheetLoaded = loaded ? 'true' : 'false';
          resolve(loaded);
        };
        const handleLoad = () => finish(this.stylesheetIsLoaded(linkTag));
        const handleError = () => finish(false);
        linkTag.addEventListener('load', handleLoad);
        linkTag.addEventListener('error', handleError);
        timeout = setTimeout(() => finish(this.stylesheetIsLoaded(linkTag)), stylesheetLoadTimeout);
        if (timeout.unref) timeout.unref();
      });
      return linkTag._hellotextStylesheetLoaded;
    }
  }, {
    key: "stylesheetIsLoaded",
    value: function stylesheetIsLoaded(linkTag) {
      return linkTag.dataset.hellotextStylesheetLoaded === 'true' || !!linkTag.sheet;
    }
  }]);
  return Business;
}();
exports.Business = Business;