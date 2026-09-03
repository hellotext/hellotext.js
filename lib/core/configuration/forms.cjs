"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Forms = void 0;
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @class Forms
 * @classdesc
 * Configuration for forms
 * @property {Boolean} autoMount - whether to auto mount forms
 * @property {Boolean|String} successMessage - whether to show success message after form completion or not
 */
let Forms = exports.Forms = /*#__PURE__*/function () {
  function Forms() {
    _classCallCheck(this, Forms);
  }
  return _createClass(Forms, null, [{
    key: "assign",
    value:
    /**
     * @param {Object} props
     * @param {Boolean} [props.autoMount=true] - whether to auto mount forms
     * @param {Boolean|String} [props.successMessage=true] - whether to show success message after form completion or not
     */
    function assign(props) {
      if (props) {
        Object.entries(props).forEach(([key, value]) => {
          this[key] = value;
        });
      }
      return this;
    }
  }, {
    key: "shouldShowSuccessMessage",
    get: function () {
      return this.successMessage;
    }
  }]);
}();
Forms.autoMount = true;
Forms.successMessage = true;