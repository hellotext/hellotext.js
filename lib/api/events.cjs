"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _models = require("../models");
var _response = require("./response");
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let EventsAPI = exports.default = /*#__PURE__*/function () {
  function EventsAPI() {
    _classCallCheck(this, EventsAPI);
  }
  return _createClass(EventsAPI, null, [{
    key: "endpoint",
    get: function () {
      return _core.Configuration.endpoint('track/events');
    }
  }, {
    key: "create",
    value: async function create({
      headers,
      body,
      keepalive = false
    }) {
      if (_models.Query.inPreviewMode) {
        return new _response.Response(true, {
          received: true
        });
      }
      const fetchOptions = {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      };

      // Do not send `keepalive: false`. The track caller opts in only for payloads
      // that fit the browser keepalive budget; omitting the key for larger events
      // preserves normal fetch behavior for rich carts/orders instead of asking
      // the browser to use an unload-safe transport it may reject.
      if (keepalive) {
        fetchOptions.keepalive = true;
      }
      const response = await fetch(this.endpoint, fetchOptions);
      return new _response.Response(response.status === 200, await response.json());
    }
  }]);
}();