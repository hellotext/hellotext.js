function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { UTM } from './utm';
var Page = /*#__PURE__*/function () {
  function Page() {
    var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    _classCallCheck(this, Page);
    this.utm = new UTM();
    this._url = url;
  }

  /**
   * Get the current page URL
   * @returns {string} The page URL
   */
  return _createClass(Page, [{
    key: "url",
    get: function get() {
      return this._url !== null && this._url !== undefined ? this._url : window.location.href;
    }

    /**
     * Get the current page title
     * @returns {string} The page title
     */
  }, {
    key: "title",
    get: function get() {
      return document.title;
    }

    /**
     * Get the current page path
     * @returns {string} The page path
     */
  }, {
    key: "path",
    get: function get() {
      if (this._url) {
        try {
          return new URL(this._url).pathname;
        } catch (e) {
          return '/';
        }
      }
      return window.location.pathname;
    }

    /**
     * Get current UTM parameters
     * @returns {Object} The UTM parameters
     */
  }, {
    key: "utmParams",
    get: function get() {
      return this.utm.current;
    }

    /**
     * Get page data for tracking
     * @returns {Object} Object containing page object and utm_params
     */
  }, {
    key: "trackingData",
    get: function get() {
      return {
        page: {
          url: this.url,
          title: this.title,
          path: this.path
        },
        utm_params: this.utmParams
      };
    }

    /**
     * Get the current page domain (root domain for cookie sharing)
     * @returns {string} The root domain with leading dot, or null if no valid URL
     */
  }, {
    key: "domain",
    get: function get() {
      try {
        var url = this.url;
        if (!url) {
          return null;
        }
        var hostname = new URL(url).hostname;
        return Page.getRootDomain(hostname);
      } catch (e) {
        return null;
      }
    }

    /**
     * Get the root domain from a hostname (static method, no instance needed)
     * @param {string} hostname - The hostname to parse
     * @returns {string} The root domain with leading dot, or null if invalid
     */
  }], [{
    key: "getRootDomain",
    value: function getRootDomain() {
      var hostname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      try {
        if (!hostname) {
          var _window$location;
          if (typeof window === 'undefined' || !((_window$location = window.location) !== null && _window$location !== void 0 && _window$location.hostname)) {
            return null;
          }
          hostname = window.location.hostname;
        }
        var parts = hostname.split('.');

        // Handle localhost or single-part domains
        if (parts.length <= 1) {
          return hostname;
        }

        // Handle e-commerce platform domains where store identifier must be preserved
        // Examples:
        //   storename.myshopify.com -> .storename.myshopify.com
        //   storename.vtexcommercestable.com.br -> .storename.vtexcommercestable.com.br
        //   storename.wixsite.com -> .storename.wixsite.com
        var platformSuffixes = ['myshopify.com', 'vtexcommercestable.com.br', 'myvtex.com', 'wixsite.com'];
        for (var suffix of platformSuffixes) {
          var suffixParts = suffix.split('.');
          // Get the last N parts of the hostname (e.g., last 2 parts for 'myshopify.com')
          var domainTail = parts.slice(-suffixParts.length).join('.');

          // Check if the tail exactly matches the platform suffix
          // and there are additional parts for the store identifier
          if (domainTail === suffix && parts.length > suffixParts.length) {
            // Include store identifier + platform suffix
            // e.g., ['secure', 'mystore', 'myshopify', 'com'] -> '.mystore.myshopify.com'
            return ".".concat(parts.slice(-(suffixParts.length + 1)).join('.'));
          }
        }

        // Simple heuristic: if TLD is 2 chars and second-level is short (<=3 chars),
        // it's likely a multi-part TLD like .com.br, .co.uk
        var tld = parts[parts.length - 1];
        var secondLevel = parts[parts.length - 2];
        if (parts.length > 2 && tld.length === 2 && secondLevel.length <= 3) {
          // Multi-part TLD: take last 3 parts (e.g., store.com.br)
          return ".".concat(parts.slice(-3).join('.'));
        }

        // Regular TLD: take last 2 parts (e.g., example.com)
        return ".".concat(parts.slice(-2).join('.'));
      } catch (e) {
        return null;
      }
    }
  }]);
}();
export { Page };