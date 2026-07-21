function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { Configuration, Locale } from '../core';
import Hellotext from '../hellotext';
var WhatsAppWidgetsAPI = /*#__PURE__*/function () {
  function WhatsAppWidgetsAPI() {
    _classCallCheck(this, WhatsAppWidgetsAPI);
  }
  _createClass(WhatsAppWidgetsAPI, null, [{
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
      var {
        appearance,
        body,
        number
      } = Configuration.whatsapp;
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
  return WhatsAppWidgetsAPI;
}();
export default WhatsAppWidgetsAPI;