"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hellotext = _interopRequireDefault(require("../../hellotext"));
var _core = require("../../core");
var _response = require("../response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let WebchatMessagesAPI = /*#__PURE__*/function () {
  function WebchatMessagesAPI(webchatId) {
    _classCallCheck(this, WebchatMessagesAPI);
    this.webchatId = webchatId;
  }
  _createClass(WebchatMessagesAPI, [{
    key: "index",
    value: async function index(params) {
      const url = new URL(this.url);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      return await fetch(url, {
        method: 'GET',
        headers: _hellotext.default.headers
      });
    }
  }, {
    key: "create",
    value: async function create(formData) {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${_hellotext.default.business.id}`
        },
        body: formData
      });
      return new _response.Response(response.ok, response);
    }
  }, {
    key: "markAsSeen",
    value: function markAsSeen() {
      fetch(this.url + '/seen', {
        method: 'PATCH',
        headers: _hellotext.default.headers,
        body: JSON.stringify({
          session: _hellotext.default.session
        })
      });
    }
  }, {
    key: "url",
    get: function () {
      return WebchatMessagesAPI.endpoint.replace(':id', this.webchatId);
    }
  }], [{
    key: "endpoint",
    get: function () {
      return _core.Configuration.endpoint(`public/webchats/:id/messages`);
    }
  }]);
  return WebchatMessagesAPI;
}();
var _default = WebchatMessagesAPI;
exports.default = _default;