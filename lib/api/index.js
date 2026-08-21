function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import BusinessesAPI from './businesses';
import EventsAPI from './events';
import FormsAPI from './forms';
import IdentificationsAPI from './identifications';
import PopupsAPI from './popups';
import WebchatsAPI from './webchats';
import WhatsAppWidgetsAPI from './whatsapp_widgets';
import AcksAPI from './acks';

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
  return _createClass(API, null, [{
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
    key: "popups",
    get: function get() {
      return PopupsAPI;
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
  }]);
}();
export { API as default };
export { Response } from './response';
export { keepaliveFor };