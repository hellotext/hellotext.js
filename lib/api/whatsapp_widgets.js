function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Configuration, Locale } from '../core';
import Hellotext from '../hellotext';
var WhatsAppWidgetsAPI = /*#__PURE__*/function () {
  function WhatsAppWidgetsAPI() {
    _classCallCheck(this, WhatsAppWidgetsAPI);
  }
  return _createClass(WhatsAppWidgetsAPI, null, [{
    key: "endpoint",
    get: function get() {
      return Configuration.endpoint('public/widgets/whatsapp');
    }
  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator(function* (id) {
        var url = new URL("".concat(this.endpoint, "/").concat(id));
        url.searchParams.append('locale', Locale.toString());
        url.searchParams.append('placement', Configuration.whatsapp.placement);
        this.appendWhatsAppOverrides(url);
        var response = yield this.fetchWidget(url);
        if (!response.ok) return null;
        var data = yield this.parseWidgetResponse(response);
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
    key: "appendWhatsAppOverrides",
    value: function appendWhatsAppOverrides(url) {
      var _appearance$launcher;
      var _Configuration$whatsa = Configuration.whatsapp,
        appearance = _Configuration$whatsa.appearance,
        body = _Configuration$whatsa.body,
        number = _Configuration$whatsa.number;
      this.appendIfSupplied(url, 'whatsapp[appearance][launcher][icon_url]', (_appearance$launcher = appearance.launcher) === null || _appearance$launcher === void 0 ? void 0 : _appearance$launcher.iconUrl);
      this.appendIfSupplied(url, 'whatsapp[number]', number);
      this.appendIfSupplied(url, 'whatsapp[body]', body);
    }
  }, {
    key: "appendIfSupplied",
    value: function appendIfSupplied(url, key, value) {
      if (value === undefined || value === null) return;
      url.searchParams.append(key, String(value));
    }
  }, {
    key: "fetchWidget",
    value: function () {
      var _fetchWidget = _asyncToGenerator(function* (url) {
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
      function fetchWidget(_x2) {
        return _fetchWidget.apply(this, arguments);
      }
      return fetchWidget;
    }()
  }, {
    key: "parseWidgetResponse",
    value: function () {
      var _parseWidgetResponse = _asyncToGenerator(function* (response) {
        try {
          return yield response.json();
        } catch (_) {
          return null;
        }
      });
      function parseWidgetResponse(_x3) {
        return _parseWidgetResponse.apply(this, arguments);
      }
      return parseWidgetResponse;
    }()
  }]);
}();
export default WhatsAppWidgetsAPI;