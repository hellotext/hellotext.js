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

      // Handle e-commerce platform domains where store identifier must be preserved
      // Examples:
      //   storename.myshopify.com -> .storename.myshopify.com
      //   storename.vtexcommercestable.com.br -> .storename.vtexcommercestable.com.br
      //   storename.wixsite.com -> .storename.wixsite.com
      const platformSuffixes = [
        'myshopify.com',
        'vtexcommercestable.com.br',
        'myvtex.com',
        'wixsite.com',
      ]

      for (const suffix of platformSuffixes) {
        const suffixParts = suffix.split('.')
        // Get the last N parts of the hostname (e.g., last 2 parts for 'myshopify.com')
        const domainTail = parts.slice(-suffixParts.length).join('.')

        // Check if the tail exactly matches the platform suffix
        // and there are additional parts for the store identifier
        if (domainTail === suffix && parts.length > suffixParts.length) {
          // Include store identifier + platform suffix
          // e.g., ['secure', 'mystore', 'myshopify', 'com'] -> '.mystore.myshopify.com'
          return `.${parts.slice(-(suffixParts.length + 1)).join('.')}`
        }
      }

      // Simple heuristic: if TLD is 2 chars and second-level is short (<=3 chars),
      // it's likely a multi-part TLD like .com.br, .co.uk
      const tld = parts[parts.length - 1]
      const secondLevel = parts[parts.length - 2]

      if (parts.length > 2 && tld.length === 2 && secondLevel.length <= 3) {
        // Multi-part TLD: take last 3 parts (e.g., store.com.br)
        return `.${parts.slice(-3).join('.')}`
      }

      // Regular TLD: take last 2 parts (e.g., example.com)
      return `.${parts.slice(-2).join('.')}`
    } catch (e) {
      return null
    }
  }
}

export { Page }
