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
var _configuration = require("./configuration.cjs");
var _locale = require("./configuration/locale.cjs");
var _webchat = require("./configuration/webchat.cjs");
var _event = _interopRequireDefault(require("./event.cjs"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }