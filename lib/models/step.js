"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Step = void 0;
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var Step = /*#__PURE__*/function () {
  function Step(data) {
    _classCallCheck(this, Step);
    this.data = data;
  }
  _createClass(Step, [{
    key: "header",
    get: function get() {
      return this.data.header;
    }
  }, {
    key: "inputs",
    get: function get() {
      return this.data.inputs;
    }
  }, {
    key: "button",
    get: function get() {
      return this.data.button;
    }
  }, {
    key: "footer",
    get: function get() {
      return this.data.footer;
    }
  }, {
    key: "hasRequiredInputs",
    get: function get() {
      return this.inputs.some(input => input.required);
    }
  }]);
  return Step;
}();
exports.Step = Step;