"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Page = void 0;
var _utm = require("./utm");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let Page = /*#__PURE__*/function () {
  function Page(url = null) {
    _classCallCheck(this, Page);
    this.utm = new _utm.UTM();
    this._url = url;
  }

  /**
   * Get the current page URL
   * @returns {string} The page URL
   */
  _createClass(Page, [{
    key: "url",
    get: function () {
      return this._url || window.location.href;
    }

    /**
     * Get the current page title
     * @returns {string} The page title
     */
  }, {
    key: "title",
    get: function () {
      return document.title;
    }

    /**
     * Get the current page path
     * @returns {string} The page path
     */
  }, {
    key: "path",
    get: function () {
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
    get: function () {
      return this.utm.current;
    }

    /**
     * Get page data for tracking
     * @returns {Object} Object containing page object and utm_params
     */
  }, {
    key: "trackingData",
    get: function () {
      return {
        page: {
          url: this.url,
          title: this.title,
          path: this.path
        },
        utm_params: this.utmParams
      };
    }
  }]);
  return Page;
}();
exports.Page = Page;