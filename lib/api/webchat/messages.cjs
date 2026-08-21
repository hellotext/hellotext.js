"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../../core");
var _hellotext = _interopRequireDefault(require("../../hellotext"));
var _response = require("../response");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let WebchatMessagesAPI = /*#__PURE__*/function () {
  function WebchatMessagesAPI(webchatId) {
    _classCallCheck(this, WebchatMessagesAPI);
    this.webchatId = webchatId;
  }
  return _createClass(WebchatMessagesAPI, [{
    key: "index",
    value: async function index(params) {
      const url = new URL(this.url);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      return await fetch(url, {
        method: 'GET',
        headers: _hellotext.default.headers
      });
    }
  }, {
    key: "catchUp",
    value: function catchUp(afterId) {
      return this.index({
        after_id: afterId,
        session: _hellotext.default.session
      });
    }
  }, {
    key: "create",
    value: async function create(formData) {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${_hellotext.default.business.id}`
        },
        body: formData
      });
      return new _response.Response(response.ok, response);
    }
  }, {
    key: "markAsSeen",
    value: function markAsSeen(messageId = null) {
      const url = messageId ? this.url + `/${messageId}` : this.url + '/seen';
      fetch(url, {
        method: 'PATCH',
        headers: _hellotext.default.headers,
        body: JSON.stringify({
          session: _hellotext.default.session
        })
      });
    }
  }, {
    key: "url",
    get: function () {
      return WebchatMessagesAPI.endpoint.replace(':id', this.webchatId);
    }
  }], [{
    key: "endpoint",
    get: function () {
      return _core.Configuration.endpoint(`public/webchats/:id/messages`);
    }
  }]);
}();
var _default = exports.default = WebchatMessagesAPI;