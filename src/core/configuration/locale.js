/**
 * @class Locale
 * @classdesc
 * Handles locale detection and configuration for the Hellotext library.
 * Provides automatic locale detection from HTML lang attribute, meta tags,
 * and browser language with fallback to 'en'.
 */
class Locale {
  static _identifier

  /**
   * Sets the locale identifier explicitly.
   * @param {string} value - The locale identifier (e.g., 'en', 'es', 'fr')
   */
  static set identifier(value) {
    this._identifier = value
  }

  /**
   * Gets the effective locale identifier.
   * Falls back to auto-detection if not explicitly set.
   * @returns {string} The locale identifier
   */
  static get identifier() {
    if (this._identifier) return this._identifier
    return this.#fromHtmlLangProperty || this.#fromMetaTag || this.#fromBrowserLanguage || 'en'
  }

  /**
   * Returns the locale identifier as a string.
   * @returns {string} The locale identifier
   */
  static toString() {
    return this.identifier
  }

  static get #fromHtmlLangProperty() {
    return document?.documentElement?.lang
  }

  static get #fromMetaTag() {
    return document?.querySelector('meta[name="locale"]')?.content
  }

  static get #fromBrowserLanguage() {
    return navigator?.language?.split('-')[0] // Extract primary language
  }
}

export { Locale }
