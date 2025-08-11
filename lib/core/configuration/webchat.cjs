"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.behaviors = exports.Webchat = void 0;
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
 * @typedef {'modal' | 'popover'} Behaviour
 */

/**
 * @enum {Behaviour}
 */
const behaviors = {
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
 * @class Webchat
 * @classdesc
 * Configuration for webchat
 * @property {String} id - the id of the webchat.
 * @property {String} container - the container to append the webchat to, defaults to 'body'
 * @property {Placement} placement - the placement of the webchat within the container, defaults to "bottom-right".
 * @property {String} classes - additional classes to apply to the webchat popup.
 * @property {String} triggerClasses - additional classes to apply to the webchat popup trigger.
 * @property {Behaviour} behaviour - the behaviour of the webchat, defaults to 'popover'.
 * @property {Style} style - the style of the webchat.
 * @property {Strategy} strategy - the strategy used to position the webchat. Defaults to 'absolute'
 */
exports.behaviors = behaviors;
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
    key: "classes",
    get: function () {
      if (typeof this._classes === 'string') {
        return this._classes.split(',').map(c => c.trim());
      } else {
        return this._classes;
      }
    },
    set: function (value) {
      if (!Array.isArray(value) && typeof value !== 'string') {
        throw new Error('classes must be an array or a string');
      }
      this._classes = value;
    }
  }, {
    key: "triggerClasses",
    get: function () {
      if (typeof this._triggerClasses === 'string') {
        return this._triggerClasses.split(',').map(c => c.trim());
      } else {
        return this._triggerClasses;
      }
    },
    set: function (value) {
      if (!Array.isArray(value) && typeof value !== 'string') {
        throw new Error('triggerClasses must be an array or a string');
      }
      this._triggerClasses = value;
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
    key: "behaviour",
    get: function () {
      return this._behaviour;
    },
    set: function (value) {
      if (!Object.values(behaviors).includes(value)) {
        throw new Error(`Invalid behaviour value: ${value}`);
      }
      this._behaviour = value;
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
  }]);
  return Webchat;
}();
exports.Webchat = Webchat;
Webchat._id = void 0;
Webchat._container = 'body';
Webchat._placement = 'bottom-right';
Webchat._classes = [];
Webchat._triggerClasses = [];
Webchat._style = {};
Webchat._behaviour = behaviors.POPOVER;
Webchat._strategy = null;