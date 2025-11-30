import { UTM } from './utm'

class Page {
  constructor(url = null) {
    this.utm = new UTM()
    this._url = url
  }

  /**
   * Get the current page URL
   * @returns {string} The page URL
   */
  get url() {
    return this._url !== null && this._url !== undefined ? this._url : window.location.href
  }

  /**
   * Get the current page title
   * @returns {string} The page title
   */
  get title() {
    return document.title
  }

  /**
   * Get the current page path
   * @returns {string} The page path
   */
  get path() {
    if (this._url) {
      try {
        return new URL(this._url).pathname
      } catch (e) {
        return '/'
      }
    }

    return window.location.pathname
  }

  /**
   * Get current UTM parameters
   * @returns {Object} The UTM parameters
   */
  get utmParams() {
    return this.utm.current
  }

  /**
   * Get page data for tracking
   * @returns {Object} Object containing page object and utm_params
   */
  get trackingData() {
    return {
      page: {
        url: this.url,
        title: this.title,
        path: this.path,
      },
      utm_params: this.utmParams,
    }
  }

  /**
   * Get the current page domain (root domain for cookie sharing)
   * @returns {string} The root domain with leading dot, or null if no valid URL
   */
  get domain() {
    try {
      const url = this.url
      if (!url) {
        return null
      }

      const hostname = new URL(url).hostname
      return Page.getRootDomain(hostname)
    } catch (e) {
      return null
    }
  }

  /**
   * Get the root domain from a hostname (static method, no instance needed)
   * @param {string} hostname - The hostname to parse
   * @returns {string} The root domain with leading dot, or null if invalid
   */
  static getRootDomain(hostname = null) {
    try {
      if (!hostname) {
        if (typeof window === 'undefined' || !window.location?.hostname) {
          return null
        }

        hostname = window.location.hostname
      }

      const parts = hostname.split('.')

      // Handle localhost or single-part domains
      if (parts.length <= 1) {
        return hostname
      }

      // For multi-part TLDs like .com.br, .co.uk, take last 3 parts
      const tld = parts[parts.length - 1]
      const secondLevel = parts[parts.length - 2]

      if (parts.length > 2 && tld.length === 2 && secondLevel.length <= 3) {
        // e.g., secure.storename.com.br -> .storename.com.br
        return `.${parts.slice(-3).join('.')}`
      }

      // For regular TLDs like .com, .net, take last 2 parts
      // e.g., www.example.com -> .example.com
      return `.${parts.slice(-2).join('.')}`
    } catch (e) {
      return null
    }
  }
}

export { Page }
