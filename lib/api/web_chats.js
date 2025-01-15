"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _core = require("../core");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var WebChatsAPI = /*#__PURE__*/function () {
  function WebChatsAPI() {
    _classCallCheck(this, WebChatsAPI);
  }
  _createClass(WebChatsAPI, null, [{
    key: "endpoint",
    get: function get() {
      return _core.Configuration.endpoint('public/webchats');
    }
  }, {
    key: "get",
    value: function () {
      var _get = _asyncToGenerator(function* (id) {
        var url = new URL("".concat(this.endpoint, "/").concat(id));
        url.searchParams.append('session', _hellotext.default.session);
        Object.entries(_core.Configuration.webChat.style).forEach(_ref => {
          var [key, value] = _ref;
          url.searchParams.append("style[".concat(key, "]"), value);
        });
        url.searchParams.append('placement', _core.Configuration.webChat.placement);
        var response = yield fetch(url, {
          method: 'GET',
          headers: _hellotext.default.headers
        });
        var htmlText = yield response.text();
        return new DOMParser().parseFromString(htmlText, "text/html").querySelector('article');
      });
      function get(_x) {
        return _get.apply(this, arguments);
      }
      return get;
    }()
  }]);
  return WebChatsAPI;
}();
var _default = WebChatsAPI;
exports.default = _default;