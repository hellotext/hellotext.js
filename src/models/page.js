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
    return this._url || window.location.href
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
}

export { Page }
