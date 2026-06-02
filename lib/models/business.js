function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import locales from '../locales';
import BusinessesAPI from '../api/businesses';
var stylesheetAttribute = 'data-hellotext-stylesheet';
var stylesheetLoadTimeout = 10000;

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
 * @property {BusinessWebchat|null} [webchat] - Dashboard webchat defaults.
 * @property {String|Array<String>} [whitelist] - Domain whitelist configuration.
 * @property {String} [subscription] - Current business subscription tier.
 */

/**
 * Public business context used by the SDK for tracking, forms, and webchat defaults.
 */
var Business = /*#__PURE__*/function () {
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
    value: function () {
      var _hydrate = _asyncToGenerator(function* () {
        try {
          var response = yield BusinessesAPI.get(this.id);
          if (response.ok === false) {
            return null;
          }
          var business = yield response.json();
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
      });
      function hydrate() {
        return _hydrate.apply(this, arguments);
      }
      return hydrate;
    }()
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
    get: function get() {
      return this.data.subscription;
    }
  }, {
    key: "country",
    get: function get() {
      return this.data.country;
    }
  }, {
    key: "enabledWhitelist",
    get: function get() {
      return this.data.whitelist !== 'disabled';
    }

    /**
     * @param {String} locale
     * @returns {void}
     */
  }, {
    key: "setLocale",
    value: function setLocale(locale) {
      if (!locales[locale]) {
        return console.warn("Locale ".concat(locale, " not found"));
      }
      if (!this.data) {
        this.data = {};
      }
      this.data.locale = locale;
    }
  }, {
    key: "locale",
    get: function get() {
      return locales[this.data.locale];
    }
  }, {
    key: "features",
    get: function get() {
      return this.data.features;
    }
  }], [{
    key: "stylesheetSelector",
    get: function get() {
      return "link[rel=\"stylesheet\"][".concat(stylesheetAttribute, "]");
    }
  }, {
    key: "ensureStylesheet",
    value: function ensureStylesheet(styleUrl) {
      var href = this.normalizedStylesheetUrl(styleUrl);
      var existingLink = this.stylesheetLinks.find(link => link.href === href);
      if (existingLink) {
        existingLink.setAttribute(stylesheetAttribute, 'true');
        return existingLink;
      }
      var linkTag = document.createElement('link');
      linkTag.rel = 'stylesheet';
      linkTag.href = styleUrl;
      linkTag.setAttribute(stylesheetAttribute, 'true');
      this.waitForStylesheet(linkTag);
      document.head.append(linkTag);
      return linkTag;
    }
  }, {
    key: "stylesheetLinks",
    get: function get() {
      if (typeof document === 'undefined') return [];
      return Array.from(document.querySelectorAll(this.stylesheetSelector));
    }
  }, {
    key: "latestStylesheet",
    get: function get() {
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
        var timeout;
        var finish = loaded => {
          clearTimeout(timeout);
          linkTag.removeEventListener('load', handleLoad);
          linkTag.removeEventListener('error', handleError);
          linkTag.dataset.hellotextStylesheetLoaded = loaded ? 'true' : 'false';
          resolve(loaded);
        };
        var handleLoad = () => finish(this.stylesheetIsLoaded(linkTag));
        var handleError = () => finish(false);
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
export { Business };