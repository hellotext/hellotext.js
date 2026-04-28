import locales from '../locales'
import BusinessesAPI from '../api/businesses'

/**
 * @typedef {Object} BusinessCountry
 * @property {String} [code] - ISO country code configured for the business.
 * @property {String} [prefix] - Phone country prefix configured for the business.
 */

/**
 * @typedef {Object} BusinessWebchat
 * @property {String} [id] - Dashboard webchat id configured for the business.
 */

/**
 * Public business metadata returned by `public/businesses/:id`.
 *
 * @typedef {Object} BusinessData
 * @property {String} [id] - Public business id.
 * @property {BusinessCountry|String} [country] - Business country metadata.
 * @property {Object} [features] - Feature flags enabled for the business.
 * @property {String} [locale] - Default dashboard locale for the business.
 * @property {String} [style_url] - Stylesheet URL to inject for dashboard-managed surfaces.
 * @property {BusinessWebchat|null} [webchat] - Dashboard webchat defaults.
 * @property {String|Array<String>} [whitelist] - Domain whitelist configuration.
 * @property {String} [subscription] - Current business subscription tier.
 */

/**
 * Public business context used by the SDK for tracking, forms, and webchat defaults.
 */
class Business {
  /**
   * @param {String} id - Public business id.
   */
  constructor(id) {
    this.id = id
    this.data = null
  }

  /**
   * Hydrates business metadata from the public business endpoint.
   *
   * Fetch failures return `null` so tracking initialization can continue even
   * when dashboard-driven webchat defaults are unavailable.
   *
   * @returns {Promise<BusinessData|null>}
   */
  async hydrate() {
    try {
      const response = await BusinessesAPI.get(this.id)

      if (response.ok === false) {
        return null
      }

      const business = await response.json()

      if (!business) {
        return null
      }

      this.setData(business)

      if (business.locale) {
        this.setLocale(business.locale)
      }

      return business
    } catch (_error) {
      return null
    }
  }

  /**
   * @param {BusinessData} data
   * @returns {void}
   */
  setData(data) {
    this.data = data

    if (typeof document !== 'undefined') {
      const linkTag = document.createElement('link')
      linkTag.rel = 'stylesheet'
      linkTag.href = data.style_url

      document.head.append(linkTag)
    }
  }

  get subscription() {
    return this.data.subscription
  }

  get country() {
    return this.data.country
  }

  get enabledWhitelist() {
    return this.data.whitelist !== 'disabled'
  }

  /**
   * @param {String} locale
   * @returns {void}
   */
  setLocale(locale) {
    if (!locales[locale]) {
      return console.warn(`Locale ${locale} not found`)
    }

    if (!this.data) {
      this.data = {}
    }

    this.data.locale = locale
  }

  get locale() {
    return locales[this.data.locale]
  }

  get features() {
    return this.data.features
  }
}

export { Business }
