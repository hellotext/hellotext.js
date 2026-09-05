function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * @class Forms
 * @classdesc
 * Configuration for forms
 * @property {Boolean} autoMount - whether to auto mount forms
 * @property {Boolean|String} successMessage - whether to show success message after form completion or not
 */
var Forms = /*#__PURE__*/function () {
  function Forms() {
    _classCallCheck(this, Forms);
  }
  _createClass(Forms, null, [{
    key: "assign",
    value:
    /**
     * @param {Object} props
     * @param {Boolean} [props.autoMount=true] - whether to auto mount forms
     * @param {Boolean|String} [props.successMessage=true] - whether to show success message after form completion or not
     */
    function assign(props) {
      if (props) {
        Object.entries(props).forEach(_ref => {
          var [key, value] = _ref;
          this[key] = value;
        });
      }
      return this;
    }
  }, {
    key: "shouldShowSuccessMessage",
    get: function get() {
      return this.successMessage;
    }
  }]);
  return Forms;
}();
Forms.autoMount = true;
Forms.successMessage = true;
export { Forms };