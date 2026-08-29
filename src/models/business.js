import locales from '../locales'
import BusinessesAPI from '../api/businesses'

const stylesheetAttribute = 'data-hellotext-stylesheet'
const stylesheetLoadTimeout = 10000

/**
 * @typedef {Object} BusinessCountry
 * @property {String} [code] - ISO country code configured for the business.
 * @property {String} [prefix] - Phone country prefix configured for the business.
 */

/**
 * @typedef {Object} BusinessWebchat
 * @property {String} [id] - Dashboard webchat id configured for the business.
 * @property {Object} [appearance] - Dashboard appearance defaults for the webchat.
 * @property {Object} [whatsapp] - Dashboard WhatsApp handoff defaults for the webchat.
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
 * @property {{id: String}|null} [popup] - Dashboard popup defaults.
 * @property {Array<{id: String}>} [popups] - Dashboard popups for automatic loading.
 * @property {BusinessWebchat|null} [webchat] - Dashboard webchat defaults.
 * @property {{id: String}|null} [whatsapp] - Dashboard WhatsApp widget defaults.
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
    this.stylesheet = null
    this.stylesheetLoaded = Promise.resolve(false)
    this.holdsStylesheet = false
  }

  /**
   * Hydrates business metadata from the public business endpoint.
   *
   * Fetch failures return `null` so tracking initialization can continue even
   * when dashboard-driven webchat defaults are unavailable.
   *
   * @returns {Promise<BusinessData|null>}
   */
  async hydrate({ apiRoot, stylesheet = true } = {}) {
    try {
      const response = apiRoot
        ? await BusinessesAPI.get(this.id, apiRoot)
        : await BusinessesAPI.get(this.id)

      if (response.ok === false) {
        return null
      }

      const business = await response.json()

      if (!business) {
        return null
      }

      this.setData(business, { stylesheet })

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
  setData(data, { stylesheet = true } = {}) {
    this.data = data

    if (stylesheet) this.loadStylesheet()
  }

  loadStylesheet() {
    if (typeof document !== 'undefined' && this.data?.style_url) {
      const stylesheet = this.constructor.ensureStylesheet(this.data.style_url)
      if (this.stylesheet !== stylesheet || !this.holdsStylesheet) {
        this.releaseStylesheet()
        this.stylesheet = stylesheet
        this.holdsStylesheet = true
        stylesheet._hellotextStylesheetUsers = (stylesheet._hellotextStylesheetUsers || 0) + 1
      }
      this.stylesheetLoaded = this.constructor.waitForStylesheet(this.stylesheet)
      return
    }

    this.releaseStylesheet()
    this.stylesheet = null
    this.stylesheetLoaded = Promise.resolve(false)
  }

  releaseStylesheet() {
    if (!this.stylesheet || !this.holdsStylesheet) return

    const stylesheet = this.stylesheet
    stylesheet._hellotextStylesheetUsers -= 1
    if (stylesheet._hellotextStylesheetUsers <= 0) stylesheet.remove()

    this.holdsStylesheet = false
    this.stylesheet = null
  }

  static get stylesheetSelector() {
    return `link[rel="stylesheet"][${stylesheetAttribute}]`
  }

  static ensureStylesheet(styleUrl) {
    const href = this.normalizedStylesheetUrl(styleUrl)
    const existingLink = this.stylesheetLinks.find(link => link.href === href)

    if (existingLink) {
      existingLink.setAttribute(stylesheetAttribute, 'true')
      return existingLink
    }

    const linkTag = document.createElement('link')
    linkTag.rel = 'stylesheet'
    linkTag.href = styleUrl
    linkTag.setAttribute(stylesheetAttribute, 'true')
    this.waitForStylesheet(linkTag)

    document.head.append(linkTag)

    return linkTag
  }

  static get stylesheetLinks() {
    if (typeof document === 'undefined') return []

    return Array.from(document.querySelectorAll(this.stylesheetSelector))
  }

  static get latestStylesheet() {
    return this.stylesheetLinks[this.stylesheetLinks.length - 1]
  }

  static normalizedStylesheetUrl(styleUrl) {
    try {
      return new URL(styleUrl, document.baseURI).href
    } catch (_error) {
      return styleUrl
    }
  }

  static waitForStylesheet(linkTag) {
    if (!linkTag) return Promise.resolve(false)
    if (this.stylesheetIsLoaded(linkTag)) return Promise.resolve(true)
    if (linkTag.dataset.hellotextStylesheetLoaded === 'false') return Promise.resolve(false)
    if (linkTag._hellotextStylesheetLoaded) return linkTag._hellotextStylesheetLoaded

    linkTag._hellotextStylesheetLoaded = new Promise(resolve => {
      let timeout

      const finish = loaded => {
        clearTimeout(timeout)
        linkTag.removeEventListener('load', handleLoad)
        linkTag.removeEventListener('error', handleError)
        linkTag.dataset.hellotextStylesheetLoaded = loaded ? 'true' : 'false'
        resolve(loaded)
      }

      const handleLoad = () => finish(this.stylesheetIsLoaded(linkTag))
      const handleError = () => finish(false)

      linkTag.addEventListener('load', handleLoad)
      linkTag.addEventListener('error', handleError)

      timeout = setTimeout(() => finish(this.stylesheetIsLoaded(linkTag)), stylesheetLoadTimeout)
      if (timeout.unref) timeout.unref()
    })

    return linkTag._hellotextStylesheetLoaded
  }

  static stylesheetIsLoaded(linkTag) {
    return linkTag.dataset.hellotextStylesheetLoaded === 'true' || !!linkTag.sheet
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
