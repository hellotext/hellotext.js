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
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
let API = exports.default = /*#__PURE__*/function () {
  function API() {
    _classCallCheck(this, API);
  }
  return _createClass(API, null, [{
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
}();