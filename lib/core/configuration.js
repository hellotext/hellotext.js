"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Configuration = void 0;
var _forms = require("./configuration/forms");
var _web_chat = require("./configuration/web_chat");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * @class Configuration
 * @classdesc
 * Configuration for Hellotext
 * @property {Boolean} [autoGenerateSession=true] - whether to auto generate session or not
 * @property {String} [session] - session id
 * @property {Forms} [forms] - form configuration
 * @property {WebChat} [webChat] - webchat configuration
 */
var Configuration = /*#__PURE__*/function () {
  function Configuration() {
    _classCallCheck(this, Configuration);
  }
  _createClass(Configuration, null, [{
    key: "assign",
    value:
    /**
     *
     * @param props
     * @param {Boolean} [props.autoGenerateSession=true] - whether to auto generate session or not
     * @param {String} [props.session] - session id
     * @param {Object} [props.forms] - form configuration
     * @returns {Configuration}
     */
    function assign(props) {
      if (props) {
        Object.entries(props).forEach(_ref => {
          var [key, value] = _ref;
          if (key === 'forms') {
            this.forms = _forms.Forms.assign(value);
          } else if (key === 'webChat') {
            this.webchat = _web_chat.WebChat.assign(value);
          } else {
            this[key] = value;
          }
        });
      }
      return this;
    }
  }, {
    key: "endpoint",
    value: function endpoint(path) {
      return "".concat(this.apiRoot, "/").concat(path);
    }
  }]);
  return Configuration;
}();
exports.Configuration = Configuration;
Configuration.apiRoot = 'https://api.hellotext.com/v1';
Configuration.autoGenerateSession = true;
Configuration.session = null;
Configuration.forms = _forms.Forms;
Configuration.webChat = _web_chat.WebChat;