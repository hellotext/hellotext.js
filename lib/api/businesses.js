function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { Configuration } from '../core';
var _default = /*#__PURE__*/function () {
  function _default() {
    _classCallCheck(this, _default);
  }
  return _createClass(_default, null, [{
    key: "endpoint",
    get: function get() {
      return Configuration.endpoint('public/businesses');
    }
  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator(function* (id) {
        return fetch("".concat(this.endpoint, "/").concat(id), {
          method: 'GET',
          headers: {
            Authorization: "Bearer ".concat(id),
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        });
      });
      function get(_x) {
        return _get.apply(this, arguments);
      }
      return get;
    }()
  }]);
}();
export { _default as default };