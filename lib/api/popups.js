function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { Configuration, Locale } from '../core';
import Hellotext from '../hellotext';
import { Response } from './response';
var PopupsAPI = /*#__PURE__*/function () {
  function PopupsAPI() {
    _classCallCheck(this, PopupsAPI);
  }
  _createClass(PopupsAPI, null, [{
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
      function fetchPopup(_x10) {
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
      function parsePopupResponse(_x11) {
        return _parsePopupResponse.apply(this, arguments);
      }
      return parsePopupResponse;
    }()
  }]);
  return PopupsAPI;
}();
export default PopupsAPI;