function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
 * @property {{id: String}|null} [popup] - Dashboard popup defaults.
 * @property {Array<{id: String}>} [popups] - Dashboard popups for automatic loading.
 * @property {BusinessWebchat|null} [webchat] - Dashboard webchat defaults.
 * @property {{id: String}|null} [whatsapp] - Dashboard WhatsApp widget defaults.
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
    this.holdsStylesheet = false;
  }

  /**
   * Hydrates business metadata from the public business endpoint.
   *
   * Fetch failures return `null` so tracking initialization can continue even
   * when dashboard-driven webchat defaults are unavailable.
   *
   * @returns {Promise<BusinessData|null>}
   */
  return _createClass(Business, [{
    key: "hydrate",
    value: (function () {
      var _hydrate = _asyncToGenerator(function* () {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          apiRoot = _ref.apiRoot,
          _ref$stylesheet = _ref.stylesheet,
          stylesheet = _ref$stylesheet === void 0 ? true : _ref$stylesheet;
        try {
          var response = apiRoot ? yield BusinessesAPI.get(this.id, apiRoot) : yield BusinessesAPI.get(this.id);
          if (response.ok === false) {
            return null;
          }
          var business = yield response.json();
          if (!business) {
            return null;
          }
          this.setData(business, {
            stylesheet
          });
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
    )
  }, {
    key: "setData",
    value: function setData(data) {
      var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref2$stylesheet = _ref2.stylesheet,
        stylesheet = _ref2$stylesheet === void 0 ? true : _ref2$stylesheet;
      this.data = data;
      if (stylesheet) this.loadStylesheet();
    }
  }, {
    key: "loadStylesheet",
    value: function loadStylesheet() {
      var _this$data;
      if (typeof document !== 'undefined' && (_this$data = this.data) !== null && _this$data !== void 0 && _this$data.style_url) {
        var stylesheet = this.constructor.ensureStylesheet(this.data.style_url);
        if (this.stylesheet !== stylesheet || !this.holdsStylesheet) {
          this.releaseStylesheet();
          this.stylesheet = stylesheet;
          this.holdsStylesheet = true;
          stylesheet._hellotextStylesheetUsers = (stylesheet._hellotextStylesheetUsers || 0) + 1;
        }
        this.stylesheetLoaded = this.constructor.waitForStylesheet(this.stylesheet);
        return;
      }
      this.releaseStylesheet();
      this.stylesheet = null;
      this.stylesheetLoaded = Promise.resolve(false);
    }
  }, {
    key: "releaseStylesheet",
    value: function releaseStylesheet() {
      if (!this.stylesheet || !this.holdsStylesheet) return;
      var stylesheet = this.stylesheet;
      stylesheet._hellotextStylesheetUsers -= 1;
      if (stylesheet._hellotextStylesheetUsers <= 0) stylesheet.remove();
      this.holdsStylesheet = false;
      this.stylesheet = null;
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
}();
export { Business };