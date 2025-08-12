import { Forms } from './configuration/forms'
import { Locale } from './configuration/locale'
import { Webchat } from './configuration/webchat'

/**
 * @class Configuration
 * @classdesc
 * Configuration for Hellotext
 * @property {Boolean} [autoGenerateSession=true] - whether to auto generate session or not
 * @property {String} [session] - session id
 * @property {Forms} [forms] - form configuration
 * @property {Webchat} [webchat] - webchat configuration
 * @property {Locale} [locale] - locale configuration
 */
class Configuration {
  static apiRoot = 'https://api.hellotext.com/v1'

  static autoGenerateSession = true
  static session = null

  static forms = Forms
  static webchat = Webchat

  /**
   *
   * @param props
   * @param {Boolean} [props.autoGenerateSession=true] - whether to auto generate session or not
   * @param {String} [props.session] - session id
   * @param {Object} [props.forms] - form configuration
   * @returns {Configuration}
   */
  static assign(props) {
    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'forms') {
          this.forms = Forms.assign(value)
        } else if (key === 'webchat') {
          this.webchat = Webchat.assign(value)
        } else {
          this[key] = value
        }
      })
    }

    return this
  }

  static set locale(locale) {
    Locale.identifier = locale
  }

  static get locale() {
    return Locale.toString()
  }

  static endpoint(path) {
    return `${this.apiRoot}/${path}`
  }
}

export { Configuration }
