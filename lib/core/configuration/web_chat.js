"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.placements = exports.behaviors = exports.WebChat = void 0;
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
var placements = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right'
};

/**
 * @typedef {'modal' | 'popover'} Behaviour
 */

/**
 * @enum {Behaviour}
 */
exports.placements = placements;
var behaviors = {
  MODAL: 'modal',
  POPOVER: 'popover'
};

/**
 * @typedef {Object} Style
 * @property {string} background - The background color or style (e.g., a hex code or color name).
 * @property {string} foreground - The foreground color or style (e.g., a hex code or color name).
 * @property {string} typography - The typography style (e.g., font family).
 */

/**
 * @class WebChat
 * @classdesc
 * Configuration for webchat
 * @property {String} id - the id of the webchat.
 * @property {String} container - the container to append the webchat to, defaults to 'body'
 * @property {Placement} placement - the placement of the webchat within the container, defaults to "bottom-right".
 * @property {String} classes - additional classes to apply to the webchat popup.
 * @property {String} triggerClasses - additional classes to apply to the webchat popup trigger.
 * @property {Behaviour} behaviour - the behaviour of the webchat, defaults to 'popover'.
 * @property {Style} style - the style of the webchat.
 */
exports.behaviors = behaviors;
var WebChat = /*#__PURE__*/function () {
  function WebChat() {
    _classCallCheck(this, WebChat);
  }
  _createClass(WebChat, null, [{
    key: "container",
    get: function get() {
      return this._container;
    },
    set: function set(value) {
      this._container = value;
    }
  }, {
    key: "placement",
    get: function get() {
      return this._placement;
    },
    set: function set(value) {
      if (!Object.values(placements).includes(value)) {
        throw new Error("Invalid placement value: ".concat(value));
      }
      this._placement = value;
    }
  }, {
    key: "classes",
    get: function get() {
      return this._classes;
    },
    set: function set(value) {
      this._classes = value;
    }
  }, {
    key: "triggerClasses",
    get: function get() {
      return this._triggerClasses;
    },
    set: function set(value) {
      this._triggerClasses = value;
    }
  }, {
    key: "id",
    get: function get() {
      return this._id;
    },
    set: function set(value) {
      this._id = value;
    }
  }, {
    key: "isSet",
    get: function get() {
      return !!this._id;
    }
  }, {
    key: "style",
    get: function get() {
      return this._style;
    },
    set: function set(value) {
      if (typeof value !== 'object') {
        throw new Error('Style must be an object');
      }
      this._style = value;
    }
  }, {
    key: "behaviour",
    get: function get() {
      return this._behaviour;
    },
    set: function set(value) {
      if (!Object.values(behaviors).includes(value)) {
        throw new Error("Invalid behaviour value: ".concat(value));
      }
      this._behaviour = value;
    }
  }, {
    key: "assign",
    value: function assign(props) {
      if (props) {
        Object.entries(props).forEach(_ref => {
          var [key, value] = _ref;
          this[key] = value;
        });
      }
      return this;
    }
  }]);
  return WebChat;
}();
exports.WebChat = WebChat;
WebChat._id = void 0;
WebChat._container = 'body';
WebChat._placement = 'bottom-right';
WebChat._classes = void 0;
WebChat._triggerClasses = void 0;
WebChat._style = {};
WebChat._behaviour = behaviors.POPOVER;