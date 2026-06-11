"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.modes = exports.Webchat = void 0;
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/**
 * @typedef {'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'} Placement
 * @description Valid placements for the webchat.
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
 * @typedef {'absolute' | 'fixed'} Strategy
 * @description Valid strategies for the webchat.
 */

/**
 * @enum {Strategy}
 */

const strategies = {
  ABSOLUTE: 'absolute',
  FIXED: 'fixed'
};

/**
 * @typedef {'modal' | 'popover'} Mode
 */

/**
 * @enum {Mode}
 */
const modes = {
  MODAL: 'modal',
  POPOVER: 'popover'
};

/**
 * @typedef {Object} Style
 * @property {string} primaryColor - The primary webchat color (e.g., a hex code or color name).
 * @property {string} secondaryColor - The secondary webchat color or style (e.g., a hex code or color name).
 * @property {string} typography - The typography style (e.g., font family).
 */

/**
 * @typedef {Object} Appearance
 * @property {Object} [header] - Header appearance overrides.
 * @property {string} [header.name] - Business name shown in the webchat header.
 * @property {Object} [launcher] - Launcher appearance overrides.
 * @property {string} [launcher.iconUrl] - Image URL used for the launcher icon.
 */

/**
 * @typedef {Object} WhatsApp
 * @property {string} [number] - WhatsApp number used by the handoff configuration.
 * @property {boolean} [restrictToChannel] - Whether handoff should be restricted to the configured channel.
 */

/**
 * @class Webchat
 * @classdesc
 * Configuration for webchat
 * @property {String} id - the id of the webchat.
 * @property {String} container - the container to append the webchat to, defaults to 'body'
 * @property {Placement} placement - the placement of the webchat within the container, defaults to "bottom-right".
 * @property {Mode} mode - how the webchat behaves while open, defaults to 'popover'.
 * @property {Object} behaviour - runtime opening behaviour for the webchat.
 * @property {Style} style - the style of the webchat.
 * @property {Appearance} appearance - appearance overrides.
 * @property {WhatsApp} whatsapp - WhatsApp handoff overrides.
 * @property {Strategy} strategy - the strategy used to position the webchat. Defaults to 'absolute'
 */
exports.modes = modes;
let Webchat = /*#__PURE__*/function () {
  function Webchat() {
    _classCallCheck(this, Webchat);
  }
  _createClass(Webchat, null, [{
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
    key: "id",
    get: function () {
      return this._id;
    },
    set: function (value) {
      this._id = value;
    }
  }, {
    key: "isSet",
    get: function () {
      return !!this._id;
    }
  }, {
    key: "style",
    get: function () {
      return this._style;
    },
    set: function (value) {
      if (typeof value !== 'object') {
        throw new Error('Style must be an object');
      }
      Object.entries(value).forEach(([key, value]) => {
        if (!['primaryColor', 'secondaryColor', 'typography'].includes(key)) {
          throw new Error(`Invalid style property: ${key}`);
        }
        if (key === 'typography') {
          return;
        }
        if (!this.isHexOrRgba(value)) {
          throw new Error(`Invalid color value: ${value} for ${key}. Colors must be hex or rgb/a.`);
        }
      });
      this._style = value;
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
        if (!['header', 'launcher'].includes(key)) {
          throw new Error(`Invalid appearance property: ${key}`);
        }
        if (!this.isPlainObject(nestedValue)) {
          throw new Error(`Appearance ${key} must be an object`);
        }
        Object.entries(nestedValue).forEach(([nestedKey, propertyValue]) => {
          if (key === 'header' && nestedKey !== 'name') {
            throw new Error(`Invalid appearance header property: ${nestedKey}`);
          }
          if (key === 'launcher' && nestedKey !== 'iconUrl') {
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
    key: "whatsapp",
    get: function () {
      return this._whatsapp;
    },
    set: function (value) {
      if (!this.isPlainObject(value)) {
        throw new Error('WhatsApp must be an object');
      }
      Object.entries(value).forEach(([key, nestedValue]) => {
        if (!['number', 'restrictToChannel'].includes(key)) {
          throw new Error(`Invalid WhatsApp property: ${key}`);
        }
        if (nestedValue == null) {
          return;
        }
        if (key === 'number' && typeof nestedValue !== 'string') {
          throw new Error(`Invalid WhatsApp number value: ${nestedValue}`);
        }
        if (key === 'restrictToChannel' && typeof nestedValue !== 'boolean') {
          throw new Error(`Invalid WhatsApp restrictToChannel value: ${nestedValue}`);
        }
      });
      this._whatsapp = value;
    }
  }, {
    key: "mode",
    get: function () {
      return this._mode;
    },
    set: function (value) {
      if (!Object.values(modes).includes(value)) {
        throw new Error(`Invalid mode value: ${value}`);
      }
      this._mode = value;
    }
  }, {
    key: "behaviour",
    get: function () {
      return this._behaviour;
    },
    set: function (value) {
      if (value == null) {
        this._behaviour = value;
        return;
      }
      if (typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`Invalid behaviour value: ${value}`);
      }
      this._behaviour = value;
    }
  }, {
    key: "hasBehaviourOverride",
    get: function () {
      return this._hasBehaviourOverride;
    }
  }, {
    key: "behaviourOverride",
    set: function (value) {
      this._hasBehaviourOverride = !!value;
    }
  }, {
    key: "strategy",
    get: function () {
      if (this._strategy) {
        return this._strategy;
      }
      return this.container == 'body' ? strategies.FIXED : strategies.ABSOLUTE;
    },
    set: function (value) {
      if (value && !Object.values(strategies).includes(value)) {
        throw new Error(`Invalid strategy value: ${value}`);
      }
      this._strategy = value;
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
    key: "isHexOrRgba",
    value: function isHexOrRgba(value) {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) || /^rgba?\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3},?\s*(0|1|0?\.\d+)?\s*\)$/.test(value);
    }
  }, {
    key: "isPlainObject",
    value: function isPlainObject(value) {
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    }
  }]);
  return Webchat;
}();
exports.Webchat = Webchat;
Webchat._id = void 0;
Webchat._container = 'body';
Webchat._placement = 'bottom-right';
Webchat._style = {};
Webchat._appearance = {};
Webchat._whatsapp = {};
Webchat._mode = modes.POPOVER;
Webchat._behaviour = null;
Webchat._hasBehaviourOverride = false;
Webchat._strategy = null;