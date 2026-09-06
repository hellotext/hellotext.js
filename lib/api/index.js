function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import BusinessesAPI from './businesses';
import EventsAPI from './events';
import FormsAPI from './forms';
import IdentificationsAPI from './identifications';
import WebchatsAPI from './webchats';
import WhatsAppWidgetsAPI from './whatsapp_widgets';
import AcksAPI from './acks';
import PushIdentitiesAPI from './push/identities';

// Browsers keep `fetch(..., { keepalive: true })` requests alive during page
// unload/navigation, which is exactly the failure mode for analytics events
// fired from checkout redirects, form submissions, tab closes, and pixel
// lifecycles. The platform also caps keepalive request bodies around 64KB, and
// browsers can reject or drop oversized requests instead of making delivery
// more reliable. Keep the limit below that ceiling so the SDK only opts in when
// the payload is small enough for the keepalive transport contract.
var KEEPALIVE_BODY_LIMIT = 60000;
function keepaliveFor(body) {
  var serializedBody = JSON.stringify(body);

  // Use byte size when the runtime exposes Blob because non-ASCII JSON can be
  // larger on the wire than its JavaScript string length. The string-length
  // fallback keeps older/non-browser runtimes conservative without pulling in
  // another encoder just for this transport hint.
  if (typeof Blob === 'undefined') {
    return serializedBody.length < KEEPALIVE_BODY_LIMIT;
  }
  return new Blob([serializedBody]).size < KEEPALIVE_BODY_LIMIT;
}
var API = /*#__PURE__*/function () {
  function API() {
    _classCallCheck(this, API);
  }
  _createClass(API, null, [{
    key: "businesses",
    get: function get() {
      return BusinessesAPI;
    }
  }, {
    key: "events",
    get: function get() {
      return EventsAPI;
    }
  }, {
    key: "forms",
    get: function get() {
      return FormsAPI;
    }
  }, {
    key: "webchats",
    get: function get() {
      return WebchatsAPI;
    }
  }, {
    key: "whatsappWidgets",
    get: function get() {
      return WhatsAppWidgetsAPI;
    }
  }, {
    key: "identifications",
    get: function get() {
      return IdentificationsAPI;
    }
  }, {
    key: "acks",
    get: function get() {
      return AcksAPI;
    }
  }, {
    key: "pushIdentities",
    get: function get() {
      return PushIdentitiesAPI;
    }
  }]);
  return API;
}();
export { API as default };
export { Response } from './response';
export { keepaliveFor };