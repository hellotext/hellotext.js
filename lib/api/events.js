"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _models = require("../models");
var _response = require("./response");
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
let EventsAPI = /*#__PURE__*/function () {
  function EventsAPI() {
    _classCallCheck(this, EventsAPI);
  }
  _createClass(EventsAPI, null, [{
    key: "endpoint",
    get: function () {
      return _core.Configuration.endpoint('track/events');
    }
  }, {
    key: "create",
    value: async function create({
      headers,
      body
    }) {
      if (_models.Query.inPreviewMode) {
        return new _response.Response(true, {
          received: true
        });
      }
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      return new _response.Response(response.status === 200, await response.json());
    }
  }]);
  return EventsAPI;
}();
exports.default = EventsAPI;