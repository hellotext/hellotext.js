function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Cookies } from './cookies';
var UTM = /*#__PURE__*/function () {
  function UTM() {
    _classCallCheck(this, UTM);
    var urlSearchParams = new URLSearchParams(window.location.search);
    var utmsFromUrl = {
      source: urlSearchParams.get('utm_source'),
      medium: urlSearchParams.get('utm_medium'),
      campaign: urlSearchParams.get('utm_campaign'),
      term: urlSearchParams.get('utm_term'),
      content: urlSearchParams.get('utm_content')
    };
    this.save(utmsFromUrl);
  }
  return _createClass(UTM, [{
    key: "save",
    value: function save(utmParams) {
      if (!utmParams.source || !utmParams.medium) return;
      var cleanUtms = Object.fromEntries(Object.entries(utmParams).filter(_ref => {
        var _ref2 = _slicedToArray(_ref, 2),
          _ = _ref2[0],
          value = _ref2[1];
        return value;
      }));
      cleanUtms.observed_at = new Date().toISOString();
      Cookies.set('hello_utm', JSON.stringify(cleanUtms));
    }
  }, {
    key: "current",
    get: function get() {
      try {
        return JSON.parse(Cookies.get('hello_utm')) || {};
      } catch (e) {
        return {};
      }
    }
  }]);
}();
export { UTM };