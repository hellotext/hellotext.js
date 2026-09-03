function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Configuration, Locale } from '../core';
import Hellotext from '../hellotext';
import { Response } from './response';
var PopupsAPI = /*#__PURE__*/function () {
  function PopupsAPI() {
    _classCallCheck(this, PopupsAPI);
  }
  return _createClass(PopupsAPI, null, [{
    key: "endpoint",
    get: function get() {
      return Configuration.endpoint('public/popups');
    }
  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator(function* (id) {
        var url = new URL("".concat(this.endpoint, "/").concat(id));
        url.searchParams.append('session', Hellotext.session);
        url.searchParams.append('locale', Locale.toString());
        url.searchParams.append('device', this.runtimeDevice);
        var response = yield this.fetchPopup(url);
        if (!response.ok) return null;
        var data = yield this.parsePopupResponse(response);
        if (!data) return null;
        if (!Hellotext.business.data) {
          Hellotext.business.setData(data.business);
          Hellotext.business.setLocale(data.locale);
        }
        return new DOMParser().parseFromString(data.html, 'text/html').querySelector('article');
      });
      function get(_x) {
        return _get.apply(this, arguments);
      }
      return get;
    }()
  }, {
    key: "submit",
    value: function () {
      var _submit = _asyncToGenerator(function* (id, data) {
        var idempotencyKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.idempotencyKey();
        var response = yield fetch("".concat(this.endpoint, "/").concat(id, "/submissions"), {
          method: 'POST',
          headers: _objectSpread(_objectSpread({}, Hellotext.headers), {}, {
            'Idempotency-Key': idempotencyKey
          }),
          body: JSON.stringify({
            session: Hellotext.session,
            popup_submission: data
          })
        });
        return new Response(response.ok, response);
      });
      function submit(_x2, _x3) {
        return _submit.apply(this, arguments);
      }
      return submit;
    }()
  }, {
    key: "resend",
    value: function () {
      var _resend = _asyncToGenerator(function* (id, submissionId, token) {
        var response = yield fetch("".concat(this.endpoint, "/").concat(id, "/submissions/").concat(submissionId, "/resend"), {
          method: 'POST',
          headers: Hellotext.headers,
          body: JSON.stringify({
            token
          })
        });
        return new Response(response.ok, response);
      });
      function resend(_x4, _x5, _x6) {
        return _resend.apply(this, arguments);
      }
      return resend;
    }()
  }, {
    key: "cancel",
    value: function () {
      var _cancel = _asyncToGenerator(function* (id, submissionId, token) {
        var response = yield fetch("".concat(this.endpoint, "/").concat(id, "/submissions/").concat(submissionId, "/cancel"), {
          method: 'POST',
          headers: Hellotext.headers,
          body: JSON.stringify({
            token
          })
        });
        return new Response(response.ok, response);
      });
      function cancel(_x7, _x8, _x9) {
        return _cancel.apply(this, arguments);
      }
      return cancel;
    }()
  }, {
    key: "idempotencyKey",
    value: function idempotencyKey() {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
      }
      return "".concat(Date.now().toString(36), "-").concat(Math.random().toString(36).slice(2));
    }
  }, {
    key: "fetchPopup",
    value: function () {
      var _fetchPopup = _asyncToGenerator(function* (url) {
        try {
          return yield fetch(url, {
            method: 'GET',
            headers: Hellotext.headers
          });
        } catch (_) {
          return {
            ok: false
          };
        }
      });
      function fetchPopup(_x0) {
        return _fetchPopup.apply(this, arguments);
      }
      return fetchPopup;
    }()
  }, {
    key: "runtimeDevice",
    get: function get() {
      if (Configuration.popup.device !== 'auto') return Configuration.popup.device;
      return window.innerWidth <= 767 ? 'mobile' : 'desktop';
    }
  }, {
    key: "parsePopupResponse",
    value: function () {
      var _parsePopupResponse = _asyncToGenerator(function* (response) {
        try {
          return yield response.json();
        } catch (_) {
          return null;
        }
      });
      function parsePopupResponse(_x1) {
        return _parsePopupResponse.apply(this, arguments);
      }
      return parsePopupResponse;
    }()
  }]);
}();
export default PopupsAPI;