"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _stimulus = require("@hotwired/stimulus");
var _hellotext = _interopRequireDefault(require("./hellotext"));
var _expandable_controller = _interopRequireDefault(require("./controllers/expandable_controller"));
var _form_controller = _interopRequireDefault(require("./controllers/form_controller"));
var _emoji_picker_controller = _interopRequireDefault(require("./controllers/webchat/emoji_picker_controller"));
var _webchat_controller = _interopRequireDefault(require("./controllers/webchat_controller"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const application = _stimulus.Application.start();
application.register('hellotext--form', _form_controller.default);
application.register('hellotext--webchat', _webchat_controller.default);
application.register('hellotext--webchat--emoji', _emoji_picker_controller.default);
application.register('hellotext--expandable', _expandable_controller.default);
window.Hellotext = _hellotext.default;
var _default = _hellotext.default;
exports.default = _default;