"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Configuration", {
  enumerable: true,
  get: function () {
    return _configuration.Configuration;
  }
});
Object.defineProperty(exports, "Event", {
  enumerable: true,
  get: function () {
    return _event.default;
  }
});
Object.defineProperty(exports, "Locale", {
  enumerable: true,
  get: function () {
    return _locale.Locale;
  }
});
Object.defineProperty(exports, "Webchat", {
  enumerable: true,
  get: function () {
    return _webchat.Webchat;
  }
});
var _configuration = require("./configuration");
var _locale = require("./configuration/locale");
var _webchat = require("./configuration/webchat");
var _event = _interopRequireDefault(require("./event"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }