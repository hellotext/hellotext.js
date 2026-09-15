"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Business = void 0;
var _locale = require("../core/configuration/locale");
var _businesses = _interopRequireDefault(require("../api/businesses"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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
 * @property {Object.<String, BusinessTranslations>} [locales] - SDK dictionaries supplied by the server.
 * @property {String} [style_url] - Stylesheet URL to inject for dashboard-managed surfaces.
 * @property {{id: String}|null} [popup] - Dashboard popup defaults.
 * @property {BusinessWebchat|null} [webchat] - Dashboard webchat defaults.
 * @property {{id: String}|null} [whatsapp] - Dashboard WhatsApp widget defaults.
 * @property {{public_key: String}|null} [push] - Push public key.
 * @property {{html: String}|null} [alert] - Smart Alert HTML.
 * @property {String|Array<String>} [whitelist] - Domain whitelist configuration.
 * @property {String} [subscription] - Current business subscription tier.
 */

/**
 * @typedef {Object} BusinessTranslations
 * @property {{powered_by: String}} white_label - Branding text.
 * @property {{parameter_not_unique: String, blank: String}} errors - Form validation messages.
 * @property {{phone: String, email: String, phone_and_email: String, none: String}} forms - Submission confirmations.
 */

/**
 * Public business context used by the SDK for tracking, forms, and webchat defaults.
 */
class Business {
  /**
   * @param {String} id - Public business id.
   */
  constructor(id) {
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
  async hydrate() {
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
      this.setLocale(_locale.Locale.toString());
      return business;
    } catch (_error) {
      return null;
    }
  }

  /**
   * @param {BusinessData} data
   * @returns {void}
   */
  setData(data) {
    this.data = data;
    if (typeof document !== 'undefined' && data.style_url) {
      this.stylesheet = this.constructor.ensureStylesheet(data.style_url);
      this.stylesheetLoaded = this.constructor.waitForStylesheet(this.stylesheet);
    } else {
      this.stylesheet = null;
      this.stylesheetLoaded = Promise.resolve(false);
    }
  }
  static get stylesheetSelector() {
    return `link[rel="stylesheet"][${stylesheetAttribute}]`;
  }
  static ensureStylesheet(styleUrl) {
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
  static get stylesheetLinks() {
    if (typeof document === 'undefined') return [];
    return Array.from(document.querySelectorAll(this.stylesheetSelector));
  }
  static get latestStylesheet() {
    return this.stylesheetLinks[this.stylesheetLinks.length - 1];
  }
  static normalizedStylesheetUrl(styleUrl) {
    try {
      return new URL(styleUrl, document.baseURI).href;
    } catch (_error) {
      return styleUrl;
    }
  }
  static waitForStylesheet(linkTag) {
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
  static stylesheetIsLoaded(linkTag) {
    return linkTag.dataset.hellotextStylesheetLoaded === 'true' || !!linkTag.sheet;
  }
  get subscription() {
    return this.data.subscription;
  }
  get country() {
    return this.data.country;
  }
  get enabledWhitelist() {
    return this.data.whitelist !== 'disabled';
  }

  /**
   * Selects a server-provided dictionary, falling back to English when unsupported.
   * Regional identifiers such as `es-MX` use their primary language.
   *
   * @param {String} locale
   * @returns {void}
   */
  setLocale(locale) {
    if (!this.data) {
      this.data = {};
    }
    const identifier = locale?.toLowerCase().split('-')[0];
    this.data.locale = Object.prototype.hasOwnProperty.call(this.data.locales || {}, identifier) ? identifier : 'en';
  }

  /** @returns {BusinessTranslations|undefined} */
  get locale() {
    const locales = this.data?.locales;
    return locales?.[this.data.locale] || locales?.en;
  }
  get features() {
    return this.data.features;
  }
}
exports.Business = Business;