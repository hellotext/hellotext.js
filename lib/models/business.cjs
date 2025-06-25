"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Business = void 0;
var _businesses = _interopRequireDefault(require("../api/businesses"));
var _locales = _interopRequireDefault(require("../locales"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let Business = /*#__PURE__*/function () {
  function Business(id) {
    _classCallCheck(this, Business);
    this.id = id;
    this.data = {};
    this.fetchPublicData();
  }
  _createClass(Business, [{
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

    // private
  }, {
    key: "fetchPublicData",
    value: function fetchPublicData() {
      _businesses.default.get(this.id).then(response => response.json()).then(data => {
        this.data = data;
        if (typeof document !== 'undefined') {
          const linkTag = document.createElement('link');
          linkTag.rel = 'stylesheet';
          linkTag.href = data.style_url;
          document.head.append(linkTag);
        }
      });
    }
  }]);
  return Business;
}();
exports.Business = Business;