"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _hellotext = _interopRequireDefault(require("../hellotext"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let WebchatsAPI = /*#__PURE__*/function () {
  function WebchatsAPI() {
    _classCallCheck(this, WebchatsAPI);
  }
  _createClass(WebchatsAPI, null, [{
    key: "endpoint",
    get: function () {
      return _core.Configuration.endpoint('public/webchats');
    }
  }, {
    key: "get",
    value: async function get(id) {
      const url = new URL(`${this.endpoint}/${id}`);
      url.searchParams.append('session', _hellotext.default.session);
      Object.entries(_core.Configuration.webchat.style).forEach(([key, value]) => {
        url.searchParams.append(`style[${key}]`, value);
      });
      url.searchParams.append('placement', _core.Configuration.webchat.placement);
      const response = await fetch(url, {
        method: 'GET',
        headers: _hellotext.default.headers
      });
      const htmlText = await response.text();
      const webchatHTML = new DOMParser().parseFromString(htmlText, 'text/html').querySelector('article');
      if (!_hellotext.default.business.data) {
        const jsonData = webchatHTML.querySelector('data-business');
        console.log(jsonData);
        _hellotext.default.business.setData(JSON.parse(jsonData));
        webchatHTML.removeAttribute('data-business');
      }
      return new DOMParser().parseFromString(htmlText, 'text/html').querySelector('article');
    }
  }]);
  return WebchatsAPI;
}();
var _default = WebchatsAPI;
exports.default = _default;