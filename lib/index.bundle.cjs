"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
require("../styles/index.css");
var _index2 = _interopRequireDefault(require("./index.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// Entry point for UMD bundle - includes CSS
// Re-export the default
var _default = _index2.default;
exports.default = _default;