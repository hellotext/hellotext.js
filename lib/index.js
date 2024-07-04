"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _stimulus = require("@hotwired/stimulus");
var _hellotext = _interopRequireDefault(require("./hellotext"));
var _form_controller = _interopRequireDefault(require("./controllers/form_controller"));
var _otp_controller = _interopRequireDefault(require("./controllers/otp_controller"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var application = _stimulus.Application.start();
application.register('hellotext--form', _form_controller.default);
application.register('hellotext--otp', _otp_controller.default);

// import '../styles/index.css'

addEventListener('DOMContentLoaded', () => {
  console.log('loadedd');
  _hellotext.default.forms.collect();
  setTimeout(() => {
    console.log('collecting');
    _hellotext.default.forms.collect();
  }, 2000);
});
var _default = _hellotext.default;
exports.default = _default;