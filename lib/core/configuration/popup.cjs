"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Popup = void 0;
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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
let Popup = /*#__PURE__*/function () {
  function Popup() {
    _classCallCheck(this, Popup);
  }
  _createClass(Popup, null, [{
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
  return Popup;
}();
exports.Popup = Popup;
Popup._id = void 0;
Popup._container = 'body';
Popup._device = 'auto';