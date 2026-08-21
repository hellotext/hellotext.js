function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Query = /*#__PURE__*/function () {
  function Query() {
    _classCallCheck(this, Query);
    this.urlSearchParams = new URLSearchParams(window.location.search);
  }
  return _createClass(Query, [{
    key: "get",
    value: function get(param) {
      return this.urlSearchParams.get(this.toHellotextParam(param));
    }
  }, {
    key: "has",
    value: function has(param) {
      return this.urlSearchParams.has(this.toHellotextParam(param));
    }
  }, {
    key: "inPreviewMode",
    get: function get() {
      return this.has('preview');
    }
  }, {
    key: "session",
    get: function get() {
      return this.get('session');
    }
  }, {
    key: "toHellotextParam",
    value: function toHellotextParam(param) {
      return "hello_".concat(param);
    }
  }], [{
    key: "inPreviewMode",
    get: function get() {
      return new this().inPreviewMode;
    }
  }]);
}();
export { Query };