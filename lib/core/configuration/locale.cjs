"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Locale = void 0;
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
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
let Locale = /*#__PURE__*/function () {
  function Locale() {
    _classCallCheck(this, Locale);
  }
  _createClass(Locale, null, [{
    key: "identifier",
    get:
    /**
     * Gets the effective locale identifier.
     * Falls back to auto-detection if not explicitly set.
     * @returns {string} The locale identifier
     */
    function () {
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
    function (value) {
      this._identifier = value;
    }
  }, {
    key: "toString",
    value: function toString() {
      return this.identifier;
    }
  }]);
  return Locale;
}();
exports.Locale = Locale;
function _get_fromHtmlLangProperty() {
  var _document, _document$documentEle;
  return (_document = document) === null || _document === void 0 ? void 0 : (_document$documentEle = _document.documentElement) === null || _document$documentEle === void 0 ? void 0 : _document$documentEle.lang;
}
function _get_fromMetaTag() {
  var _document2, _document2$querySelec;
  return (_document2 = document) === null || _document2 === void 0 ? void 0 : (_document2$querySelec = _document2.querySelector('meta[name="locale"]')) === null || _document2$querySelec === void 0 ? void 0 : _document2$querySelec.content;
}
function _get_fromBrowserLanguage() {
  var _navigator, _navigator$language;
  return (_navigator = navigator) === null || _navigator === void 0 ? void 0 : (_navigator$language = _navigator.language) === null || _navigator$language === void 0 ? void 0 : _navigator$language.split('-')[0]; // Extract primary language
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