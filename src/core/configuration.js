import { Forms } from './configuration/forms'

class Configuration {
  static apiRoot = 'https://api.hellotext.com/v1'

  static autoGenerateSession = true
  static session = null

  static forms = Forms

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
        } else {
          this[key] = value
        }
      })
    }

    return this
  }

  static endpoint(path) {
    return `${this.apiRoot}/${path}`
  }
}

export {Configuration}
