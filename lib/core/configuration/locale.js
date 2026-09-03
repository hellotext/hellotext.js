function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _classPrivateFieldLooseBase(e, t) { if (!{}.hasOwnProperty.call(e, t)) throw new TypeError("attempted to use private field on non-instance"); return e; }
var id = 0;
function _classPrivateFieldLooseKey(e) { return "__private_" + id++ + "_" + e; }
var _fromHtmlLangProperty = /*#__PURE__*/_classPrivateFieldLooseKey("fromHtmlLangProperty");
var _fromMetaTag = /*#__PURE__*/_classPrivateFieldLooseKey("fromMetaTag");
var _fromBrowserLanguage = /*#__PURE__*/_classPrivateFieldLooseKey("fromBrowserLanguage");
/**
 * @class Locale
 * @classdesc
 * Handles locale detection and configuration for the Hellotext library.
 * Provides automatic locale detection from HTML lang attribute, meta tags,
 * and browser language with fallback to 'en'.
 */
var Locale = /*#__PURE__*/function () {
  function Locale() {
    _classCallCheck(this, Locale);
  }
  return _createClass(Locale, null, [{
    key: "identifier",
    get:
    /**
     * Gets the effective locale identifier.
     * Falls back to auto-detection if not explicitly set.
     * @returns {string} The locale identifier
     */
    function get() {
      if (this._identifier) return this._identifier;
      return _classPrivateFieldLooseBase(this, _fromHtmlLangProperty)[_fromHtmlLangProperty] || _classPrivateFieldLooseBase(this, _fromMetaTag)[_fromMetaTag] || _classPrivateFieldLooseBase(this, _fromBrowserLanguage)[_fromBrowserLanguage] || 'en';
    }

    /**
     * Returns the locale identifier as a string.
     * @returns {string} The locale identifier
     */,
    set:
    /**
     * Sets the locale identifier explicitly.
     * @param {string} value - The locale identifier (e.g., 'en', 'es')
     */
    function set(value) {
      this._identifier = value;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.identifier;
    }
  }]);
}();
function _get_fromHtmlLangProperty() {
  var _document;
  return (_document = document) === null || _document === void 0 || (_document = _document.documentElement) === null || _document === void 0 ? void 0 : _document.lang;
}
function _get_fromMetaTag() {
  var _document2;
  return (_document2 = document) === null || _document2 === void 0 || (_document2 = _document2.querySelector('meta[name="locale"]')) === null || _document2 === void 0 ? void 0 : _document2.content;
}
function _get_fromBrowserLanguage() {
  var _navigator;
  return (_navigator = navigator) === null || _navigator === void 0 || (_navigator = _navigator.language) === null || _navigator === void 0 ? void 0 : _navigator.split('-')[0]; // Extract primary language
}
Object.defineProperty(Locale, _fromBrowserLanguage, {
  get: _get_fromBrowserLanguage,
  set: void 0
});
Object.defineProperty(Locale, _fromMetaTag, {
  get: _get_fromMetaTag,
  set: void 0
});
Object.defineProperty(Locale, _fromHtmlLangProperty, {
  get: _get_fromHtmlLangProperty,
  set: void 0
});
Locale._identifier = void 0;
export { Locale };