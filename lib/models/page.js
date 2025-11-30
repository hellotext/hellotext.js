function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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
  _createClass(Page, [{
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

        // Handle platform domains where store identifier must be included
        // e.g., storename.myshopify.com -> .storename.myshopify.com
        // e.g., storename.vtexcommercestable.com.br -> .storename.vtexcommercestable.com.br
        // e.g., storename.wixsite.com -> .storename.wixsite.com
        if (parts.length >= 3) {
          var platformPatterns = ['myshopify.com', 'vtexcommercestable.com.br', 'myvtex.com', 'wixsite.com'];
          for (var pattern of platformPatterns) {
            var patternParts = pattern.split('.');
            var matchParts = parts.slice(-patternParts.length);

            // Exact match check for each part of the suffix
            if (matchParts.join('.') === pattern) {
              // Take pattern parts + 1 for store identifier
              return ".".concat(parts.slice(-(patternParts.length + 1)).join('.'));
            }
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
  return Page;
}();
export { Page };