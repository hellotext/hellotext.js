function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
import BusinessesAPI from './businesses';
import EventsAPI from './events';
import FormsAPI from './forms';
import IdentificationsAPI from './identifications';
import WebchatsAPI from './webchats';
var API = /*#__PURE__*/function () {
  function API() {
    _classCallCheck(this, API);
  }
  _createClass(API, null, [{
    key: "businesses",
    get: function get() {
      return BusinessesAPI;
    }
  }, {
    key: "events",
    get: function get() {
      return EventsAPI;
    }
  }, {
    key: "forms",
    get: function get() {
      return FormsAPI;
    }
  }, {
    key: "webchats",
    get: function get() {
      return WebchatsAPI;
    }
  }, {
    key: "identifications",
    get: function get() {
      return IdentificationsAPI;
    }
  }]);
  return API;
}();
export { API as default };
export { Response } from './response';