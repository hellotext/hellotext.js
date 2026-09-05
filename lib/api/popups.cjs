"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _response = require("./response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let PopupsAPI = /*#__PURE__*/function () {
  function PopupsAPI() {
    _classCallCheck(this, PopupsAPI);
  }
  _createClass(PopupsAPI, null, [{
    key: "endpoint",
    get: function () {
      return _core.Configuration.endpoint('public/popups');
    }
  }, {
    key: "get",
    value: async function get(id) {
      const url = new URL(`${this.endpoint}/${id}`);
      url.searchParams.append('session', _hellotext.default.session);
      url.searchParams.append('locale', _core.Locale.toString());
      url.searchParams.append('device', this.runtimeDevice);
      const response = await this.fetchPopup(url);
      if (!response.ok) return null;
      const data = await this.parsePopupResponse(response);
      if (!data) return null;
      if (!_hellotext.default.business.data) {
        _hellotext.default.business.setData(data.business);
        _hellotext.default.business.setLocale(data.locale);
      }
      return new DOMParser().parseFromString(data.html, 'text/html').querySelector('article');
    }
  }, {
    key: "submit",
    value: async function submit(id, data, idempotencyKey = this.idempotencyKey()) {
      const response = await fetch(`${this.endpoint}/${id}/submissions`, {
        method: 'POST',
        headers: {
          ..._hellotext.default.headers,
          'Idempotency-Key': idempotencyKey
        },
        body: JSON.stringify({
          session: _hellotext.default.session,
          popup_submission: data
        })
      });
      return new _response.Response(response.ok, response);
    }
  }, {
    key: "resend",
    value: async function resend(id, submissionId, token) {
      const response = await fetch(`${this.endpoint}/${id}/submissions/${submissionId}/resend`, {
        method: 'POST',
        headers: _hellotext.default.headers,
        body: JSON.stringify({
          token
        })
      });
      return new _response.Response(response.ok, response);
    }
  }, {
    key: "cancel",
    value: async function cancel(id, submissionId, token) {
      const response = await fetch(`${this.endpoint}/${id}/submissions/${submissionId}/cancel`, {
        method: 'POST',
        headers: _hellotext.default.headers,
        body: JSON.stringify({
          token
        })
      });
      return new _response.Response(response.ok, response);
    }
  }, {
    key: "idempotencyKey",
    value: function idempotencyKey() {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    }
  }, {
    key: "fetchPopup",
    value: async function fetchPopup(url) {
      try {
        return await fetch(url, {
          method: 'GET',
          headers: _hellotext.default.headers
        });
      } catch (_) {
        return {
          ok: false
        };
      }
    }
  }, {
    key: "runtimeDevice",
    get: function () {
      if (_core.Configuration.popup.device !== 'auto') return _core.Configuration.popup.device;
      return window.innerWidth <= 767 ? 'mobile' : 'desktop';
    }
  }, {
    key: "parsePopupResponse",
    value: async function parsePopupResponse(response) {
      try {
        return await response.json();
      } catch (_) {
        return null;
      }
    }
  }]);
  return PopupsAPI;
}();
var _default = PopupsAPI;
exports.default = _default;