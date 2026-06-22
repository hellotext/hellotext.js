function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import { Configuration, Locale } from '../core/index.js';
import Hellotext from '../hellotext.js';
var WebchatsAPI = /*#__PURE__*/function () {
  function WebchatsAPI() {
    _classCallCheck(this, WebchatsAPI);
  }
  _createClass(WebchatsAPI, null, [{
    key: "endpoint",
    get: function get() {
      return Configuration.endpoint('public/webchats');
    }
  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator(function* (id) {
        var url = new URL("".concat(this.endpoint, "/").concat(id));
        url.searchParams.append('session', Hellotext.session);
        url.searchParams.append('locale', Locale.toString());
        Object.entries(Configuration.webchat.style).forEach(_ref => {
          var [key, value] = _ref;
          url.searchParams.append("style[".concat(key, "]"), value);
        });
        this.appendWebchatOverrides(url);
        url.searchParams.append('placement', Configuration.webchat.placement);
        var response = yield fetch(url, {
          method: 'GET',
          headers: Hellotext.headers
        });
        var data = yield response.json();
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
    key: "appendWebchatOverrides",
    value: function appendWebchatOverrides(url) {
      var _appearance$header, _appearance$launcher;
      var {
        appearance,
        whatsapp
      } = Configuration.webchat;
      this.appendIfSupplied(url, 'webchat[appearance][header][name]', (_appearance$header = appearance.header) === null || _appearance$header === void 0 ? void 0 : _appearance$header.name);
      this.appendIfSupplied(url, 'webchat[appearance][launcher][icon_url]', (_appearance$launcher = appearance.launcher) === null || _appearance$launcher === void 0 ? void 0 : _appearance$launcher.iconUrl);
      this.appendIfSupplied(url, 'webchat[handoff][identifier]', whatsapp.number);
      this.appendIfSupplied(url, 'webchat[handoff][restrict_to_channel]', whatsapp.restrictToChannel);
    }
  }, {
    key: "appendIfSupplied",
    value: function appendIfSupplied(url, key, value) {
      if (value === undefined || value === null) return;
      url.searchParams.append(key, String(value));
    }
  }]);
  return WebchatsAPI;
}();
export default WebchatsAPI;