function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Configuration, Locale } from '../core';
import Hellotext from '../hellotext';
var WebchatsAPI = /*#__PURE__*/function () {
  function WebchatsAPI() {
    _classCallCheck(this, WebchatsAPI);
  }
  return _createClass(WebchatsAPI, null, [{
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
          var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];
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
      var _Configuration$webcha = Configuration.webchat,
        appearance = _Configuration$webcha.appearance,
        whatsapp = _Configuration$webcha.whatsapp;
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
}();
export default WebchatsAPI;