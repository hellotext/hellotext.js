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
var placements = {
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
var WhatsApp = /*#__PURE__*/function () {
  function WhatsApp() {
    _classCallCheck(this, WhatsApp);
  }
  _createClass(WhatsApp, null, [{
    key: "id",
    get: function get() {
      return this._id;
    },
    set: function set(value) {
      this._id = value;
    }
  }, {
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
    key: "appearance",
    get: function get() {
      return this._appearance;
    },
    set: function set(value) {
      if (!this.isPlainObject(value)) {
        throw new Error('Appearance must be an object');
      }
      Object.entries(value).forEach(_ref => {
        var [key, nestedValue] = _ref;
        if (key !== 'launcher') {
          throw new Error("Invalid appearance property: ".concat(key));
        }
        if (!this.isPlainObject(nestedValue)) {
          throw new Error("Appearance ".concat(key, " must be an object"));
        }
        Object.entries(nestedValue).forEach(_ref2 => {
          var [nestedKey, propertyValue] = _ref2;
          if (nestedKey !== 'iconUrl') {
            throw new Error("Invalid appearance launcher property: ".concat(nestedKey));
          }
          if (propertyValue == null) {
            return;
          }
          if (typeof propertyValue !== 'string') {
            throw new Error("Invalid appearance ".concat(key, ".").concat(nestedKey, " value: ").concat(propertyValue));
          }
        });
      });
      this._appearance = value;
    }
  }, {
    key: "number",
    get: function get() {
      return this._number;
    },
    set: function set(value) {
      if (value != null && typeof value !== 'string') {
        throw new Error("Invalid number value: ".concat(value));
      }
      this._number = value;
    }
  }, {
    key: "body",
    get: function get() {
      return this._body;
    },
    set: function set(value) {
      if (value != null && typeof value !== 'string') {
        throw new Error("Invalid body value: ".concat(value));
      }
      this._body = value;
    }
  }, {
    key: "assign",
    value: function assign(props) {
      if (props) {
        Object.entries(props).forEach(_ref3 => {
          var [key, value] = _ref3;
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
WhatsApp._id = void 0;
WhatsApp._container = 'body';
WhatsApp._placement = 'bottom-right';
WhatsApp._appearance = {};
WhatsApp._number = null;
WhatsApp._body = null;
export { WhatsApp };