"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Response", {
  enumerable: true,
  get: function () {
    return _response.Response;
  }
});
exports.default = void 0;
exports.keepaliveFor = keepaliveFor;
var _businesses = _interopRequireDefault(require("./businesses"));
var _events = _interopRequireDefault(require("./events"));
var _forms = _interopRequireDefault(require("./forms"));
var _identifications = _interopRequireDefault(require("./identifications"));
var _popups = _interopRequireDefault(require("./popups"));
var _webchats = _interopRequireDefault(require("./webchats"));
var _whatsapp_widgets = _interopRequireDefault(require("./whatsapp_widgets"));
var _acks = _interopRequireDefault(require("./acks"));
var _response = require("./response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
// Browsers keep `fetch(..., { keepalive: true })` requests alive during page
// unload/navigation, which is exactly the failure mode for analytics events
// fired from checkout redirects, form submissions, tab closes, and pixel
// lifecycles. The platform also caps keepalive request bodies around 64KB, and
// browsers can reject or drop oversized requests instead of making delivery
// more reliable. Keep the limit below that ceiling so the SDK only opts in when
// the payload is small enough for the keepalive transport contract.
const KEEPALIVE_BODY_LIMIT = 60000;
function keepaliveFor(body) {
  const serializedBody = JSON.stringify(body);

  // Use byte size when the runtime exposes Blob because non-ASCII JSON can be
  // larger on the wire than its JavaScript string length. The string-length
  // fallback keeps older/non-browser runtimes conservative without pulling in
  // another encoder just for this transport hint.
  if (typeof Blob === 'undefined') {
    return serializedBody.length < KEEPALIVE_BODY_LIMIT;
  }
  return new Blob([serializedBody]).size < KEEPALIVE_BODY_LIMIT;
}
let API = /*#__PURE__*/function () {
  function API() {
    _classCallCheck(this, API);
  }
  _createClass(API, null, [{
    key: "businesses",
    get: function () {
      return _businesses.default;
    }
  }, {
    key: "events",
    get: function () {
      return _events.default;
    }
  }, {
    key: "forms",
    get: function () {
      return _forms.default;
    }
  }, {
    key: "popups",
    get: function () {
      return _popups.default;
    }
  }, {
    key: "webchats",
    get: function () {
      return _webchats.default;
    }
  }, {
    key: "whatsappWidgets",
    get: function () {
      return _whatsapp_widgets.default;
    }
  }, {
    key: "identifications",
    get: function () {
      return _identifications.default;
    }
  }, {
    key: "acks",
    get: function () {
      return _acks.default;
    }
  }]);
  return API;
}();
exports.default = API;