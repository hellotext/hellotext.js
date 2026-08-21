function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
 * @typedef {'absolute' | 'fixed'} Strategy
 * @description Valid strategies for the webchat.
 */

/**
 * @enum {Strategy}
 */

var strategies = {
  ABSOLUTE: 'absolute',
  FIXED: 'fixed'
};

/**
 * @typedef {'modal' | 'popover'} Mode
 */

/**
 * @enum {Mode}
 */
var modes = {
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
var Webchat = /*#__PURE__*/function () {
  function Webchat() {
    _classCallCheck(this, Webchat);
  }
  return _createClass(Webchat, null, [{
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
      Object.entries(value).forEach(_ref => {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];
        if (!['primaryColor', 'secondaryColor', 'typography'].includes(key)) {
          throw new Error("Invalid style property: ".concat(key));
        }
        if (key === 'typography') {
          return;
        }
        if (!this.isHexOrRgba(value)) {
          throw new Error("Invalid color value: ".concat(value, " for ").concat(key, ". Colors must be hex or rgb/a."));
        }
      });
      this._style = value;
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
      Object.entries(value).forEach(_ref3 => {
        var _ref4 = _slicedToArray(_ref3, 2),
          key = _ref4[0],
          nestedValue = _ref4[1];
        if (!['header', 'launcher'].includes(key)) {
          throw new Error("Invalid appearance property: ".concat(key));
        }
        if (!this.isPlainObject(nestedValue)) {
          throw new Error("Appearance ".concat(key, " must be an object"));
        }
        Object.entries(nestedValue).forEach(_ref5 => {
          var _ref6 = _slicedToArray(_ref5, 2),
            nestedKey = _ref6[0],
            propertyValue = _ref6[1];
          if (key === 'header' && nestedKey !== 'name') {
            throw new Error("Invalid appearance header property: ".concat(nestedKey));
          }
          if (key === 'launcher' && nestedKey !== 'iconUrl') {
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
    key: "whatsapp",
    get: function get() {
      return this._whatsapp;
    },
    set: function set(value) {
      if (!this.isPlainObject(value)) {
        throw new Error('WhatsApp must be an object');
      }
      Object.entries(value).forEach(_ref7 => {
        var _ref8 = _slicedToArray(_ref7, 2),
          key = _ref8[0],
          nestedValue = _ref8[1];
        if (!['number', 'restrictToChannel'].includes(key)) {
          throw new Error("Invalid WhatsApp property: ".concat(key));
        }
        if (nestedValue == null) {
          return;
        }
        if (key === 'number' && typeof nestedValue !== 'string') {
          throw new Error("Invalid WhatsApp number value: ".concat(nestedValue));
        }
        if (key === 'restrictToChannel' && typeof nestedValue !== 'boolean') {
          throw new Error("Invalid WhatsApp restrictToChannel value: ".concat(nestedValue));
        }
      });
      this._whatsapp = value;
    }
  }, {
    key: "mode",
    get: function get() {
      return this._mode;
    },
    set: function set(value) {
      if (!Object.values(modes).includes(value)) {
        throw new Error("Invalid mode value: ".concat(value));
      }
      this._mode = value;
    }
  }, {
    key: "behaviour",
    get: function get() {
      return this._behaviour;
    },
    set: function set(value) {
      if (value == null) {
        this._behaviour = value;
        return;
      }
      if (typeof value !== 'object' || Array.isArray(value)) {
        throw new Error("Invalid behaviour value: ".concat(value));
      }
      this._behaviour = value;
    }
  }, {
    key: "hasBehaviourOverride",
    get: function get() {
      return this._hasBehaviourOverride;
    }
  }, {
    key: "behaviourOverride",
    set: function set(value) {
      this._hasBehaviourOverride = !!value;
    }
  }, {
    key: "strategy",
    get: function get() {
      if (this._strategy) {
        return this._strategy;
      }
      return this.container == 'body' ? strategies.FIXED : strategies.ABSOLUTE;
    },
    set: function set(value) {
      if (value && !Object.values(strategies).includes(value)) {
        throw new Error("Invalid strategy value: ".concat(value));
      }
      this._strategy = value;
    }
  }, {
    key: "assign",
    value: function assign(props) {
      if (props) {
        Object.entries(props).forEach(_ref9 => {
          var _ref0 = _slicedToArray(_ref9, 2),
            key = _ref0[0],
            value = _ref0[1];
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
}();
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
export { modes, Webchat };