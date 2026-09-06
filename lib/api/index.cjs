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
var _webchats = _interopRequireDefault(require("./webchats"));
var _whatsapp_widgets = _interopRequireDefault(require("./whatsapp_widgets"));
var _acks = _interopRequireDefault(require("./acks"));
var _identities = _interopRequireDefault(require("./push/identities"));
var _alerts = _interopRequireDefault(require("./push/alerts"));
var _response = require("./response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
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
class API {
  static get businesses() {
    return _businesses.default;
  }
  static get events() {
    return _events.default;
  }
  static get forms() {
    return _forms.default;
  }
  static get webchats() {
    return _webchats.default;
  }
  static get whatsappWidgets() {
    return _whatsapp_widgets.default;
  }
  static get identifications() {
    return _identifications.default;
  }
  static get acks() {
    return _acks.default;
  }
  static get pushAlerts() {
    return _alerts.default;
  }
  static get pushIdentities() {
    return _identities.default;
  }
}
exports.default = API;