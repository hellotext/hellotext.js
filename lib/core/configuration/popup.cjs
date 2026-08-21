"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Popup = void 0;
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * @typedef {'auto' | 'mobile' | 'desktop'} PopupDevice
 * @description Runtime device override for popup loading.
 */
/**
 * @class Popup
 * @classdesc Configuration for dashboard popups.
 * @property {String} id - The popup id.
 * @property {String} container - The container to append the popup to, defaults to 'body'.
 * @property {PopupDevice} device - Runtime device preference, defaults to 'auto'.
 */
let Popup = exports.Popup = /*#__PURE__*/function () {
  function Popup() {
    _classCallCheck(this, Popup);
  }
  return _createClass(Popup, null, [{
    key: "id",
    get: function () {
      return this._id;
    },
    set: function (value) {
      this._id = value;
    }
  }, {
    key: "container",
    get: function () {
      return this._container;
    },
    set: function (value) {
      this._container = value;
    }
  }, {
    key: "device",
    get: function () {
      return this._device;
    },
    set: function (value) {
      if (!['auto', 'mobile', 'desktop'].includes(value)) {
        throw new Error(`Invalid popup device value: ${value}`);
      }
      this._device = value;
    }
  }, {
    key: "assign",
    value: function assign(props) {
      if (props) {
        Object.entries(props).forEach(([key, value]) => {
          this[key] = value;
        });
      }
      return this;
    }
  }]);
}();
Popup._id = void 0;
Popup._container = 'body';
Popup._device = 'auto';