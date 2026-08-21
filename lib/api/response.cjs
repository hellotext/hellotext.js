"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Response = void 0;
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldLooseBase(e, t) { if (!{}.hasOwnProperty.call(e, t)) throw new TypeError("attempted to use private field on non-instance"); return e; }
var id = 0;
function _classPrivateFieldLooseKey(e) { return "__private_" + id++ + "_" + e; }
var _success = /*#__PURE__*/_classPrivateFieldLooseKey("success");
/**
 * Response class
 * @class
 * @classdesc Represents a response from the API
 * @property {Boolean} succeeded
 * @property {Object} data
 */
let Response = exports.Response = /*#__PURE__*/function () {
  function Response(success, response) {
    _classCallCheck(this, Response);
    Object.defineProperty(this, _success, {
      writable: true,
      value: void 0
    });
    this.response = response;
    _classPrivateFieldLooseBase(this, _success)[_success] = success;
  }

  /**
   * Get the response data
   * @returns {*}
   */
  return _createClass(Response, [{
    key: "data",
    get: function () {
      return this.response;
    }

    /**
     * Parse the response as JSON
     * @returns {Promise<*>}
     */
  }, {
    key: "json",
    value: async function json() {
      return await this.response.json();
    }

    /**
     * Has the request failed?
     * @returns {boolean}
     */
  }, {
    key: "failed",
    get: function () {
      return _classPrivateFieldLooseBase(this, _success)[_success] === false;
    }

    /**
     * Has the request succeeded?
     * @returns {boolean}
     */
  }, {
    key: "succeeded",
    get: function () {
      return _classPrivateFieldLooseBase(this, _success)[_success] === true;
    }
  }]);
}();