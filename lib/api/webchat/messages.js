"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hellotext = _interopRequireDefault(require("../../hellotext"));
var _core = require("../../core");
var _response = require("../response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var WebchatMessagesAPI = /*#__PURE__*/function () {
  function WebchatMessagesAPI(webchatId) {
    _classCallCheck(this, WebchatMessagesAPI);
    this.webchatId = webchatId;
  }
  _createClass(WebchatMessagesAPI, [{
    key: "index",
    value: function () {
      var _index = _asyncToGenerator(function* (params) {
        var url = new URL(this.url);
        Object.entries(params).forEach(_ref => {
          var [key, value] = _ref;
          url.searchParams.append(key, value);
        });
        return yield fetch(url, {
          method: 'GET',
          headers: _hellotext.default.headers
        });
      });
      function index(_x) {
        return _index.apply(this, arguments);
      }
      return index;
    }()
  }, {
    key: "create",
    value: function () {
      var _create = _asyncToGenerator(function* (formData) {
        var response = yield fetch(this.url, {
          method: 'POST',
          headers: {
            Authorization: "Bearer ".concat(_hellotext.default.business.id)
          },
          body: formData
        });
        return new _response.Response(response.ok, response);
      });
      function create(_x2) {
        return _create.apply(this, arguments);
      }
      return create;
    }()
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
    get: function get() {
      return WebchatMessagesAPI.endpoint.replace(':id', this.webchatId);
    }
  }], [{
    key: "endpoint",
    get: function get() {
      return _core.Configuration.endpoint("public/webchats/:id/messages");
    }
  }]);
  return WebchatMessagesAPI;
}();
var _default = WebchatMessagesAPI;
exports.default = _default;