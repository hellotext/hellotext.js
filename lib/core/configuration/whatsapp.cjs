"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WhatsApp = void 0;
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * @typedef {'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'} Placement
 * @description Valid placements for the WhatsApp widget.
 */

/**
 * @enum {Placement}
 */
const placements = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right'
};

/**
 * @typedef {Object} WhatsAppWidgetAppearance
 * @property {Object} [launcher] - Launcher appearance overrides.
 * @property {string} [launcher.iconUrl] - Image URL used for the launcher icon.
 */

/**
 * @class WhatsApp
 * @classdesc Configuration for the standalone WhatsApp widget.
 * @property {String} id - The id of the WhatsApp widget.
 * @property {String} container - The container to append the widget to, defaults to 'body'.
 * @property {Placement} placement - The placement of the widget, defaults to 'bottom-right'.
 * @property {String} number - WhatsApp number used by the widget link.
 * @property {String} body - Prefilled WhatsApp compose text.
 * @property {WhatsAppWidgetAppearance} appearance - Appearance overrides.
 */
let WhatsApp = /*#__PURE__*/function () {
  function WhatsApp() {
    _classCallCheck(this, WhatsApp);
  }
  _createClass(WhatsApp, null, [{
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
    key: "placement",
    get: function () {
      return this._placement;
    },
    set: function (value) {
      if (!Object.values(placements).includes(value)) {
        throw new Error(`Invalid placement value: ${value}`);
      }
      this._placement = value;
    }
  }, {
    key: "appearance",
    get: function () {
      return this._appearance;
    },
    set: function (value) {
      if (!this.isPlainObject(value)) {
        throw new Error('Appearance must be an object');
      }
      Object.entries(value).forEach(([key, nestedValue]) => {
        if (key !== 'launcher') {
          throw new Error(`Invalid appearance property: ${key}`);
        }
        if (!this.isPlainObject(nestedValue)) {
          throw new Error(`Appearance ${key} must be an object`);
        }
        Object.entries(nestedValue).forEach(([nestedKey, propertyValue]) => {
          if (nestedKey !== 'iconUrl') {
            throw new Error(`Invalid appearance launcher property: ${nestedKey}`);
          }
          if (propertyValue == null) {
            return;
          }
          if (typeof propertyValue !== 'string') {
            throw new Error(`Invalid appearance ${key}.${nestedKey} value: ${propertyValue}`);
          }
        });
      });
      this._appearance = value;
    }
  }, {
    key: "number",
    get: function () {
      return this._number;
    },
    set: function (value) {
      if (value != null && typeof value !== 'string') {
        throw new Error(`Invalid number value: ${value}`);
      }
      this._number = value;
    }
  }, {
    key: "body",
    get: function () {
      return this._body;
    },
    set: function (value) {
      if (value != null && typeof value !== 'string') {
        throw new Error(`Invalid body value: ${value}`);
      }
      this._body = value;
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
  }, {
    key: "isPlainObject",
    value: function isPlainObject(value) {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
  }]);
  return WhatsApp;
}();
exports.WhatsApp = WhatsApp;
WhatsApp._id = void 0;
WhatsApp._container = 'body';
WhatsApp._placement = 'bottom-right';
WhatsApp._appearance = {};
WhatsApp._number = null;
WhatsApp._body = null;