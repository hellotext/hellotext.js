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
  return _createClass(WhatsApp, null, [{
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
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          nestedValue = _ref2[1];
        if (key !== 'launcher') {
          throw new Error("Invalid appearance property: ".concat(key));
        }
        if (!this.isPlainObject(nestedValue)) {
          throw new Error("Appearance ".concat(key, " must be an object"));
        }
        Object.entries(nestedValue).forEach(_ref3 => {
          var _ref4 = _slicedToArray(_ref3, 2),
            nestedKey = _ref4[0],
            propertyValue = _ref4[1];
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
        Object.entries(props).forEach(_ref5 => {
          var _ref6 = _slicedToArray(_ref5, 2),
            key = _ref6[0],
            value = _ref6[1];
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
}();
WhatsApp._id = void 0;
WhatsApp._container = 'body';
WhatsApp._placement = 'bottom-right';
WhatsApp._appearance = {};
WhatsApp._number = null;
WhatsApp._body = null;
export { WhatsApp };