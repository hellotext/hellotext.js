/**
 * @class Forms
 * @classdesc
 * Configuration for forms
 * @property {Boolean} autoMount - whether to auto mount forms
 * @property {Boolean|String} successMessage - whether to show success message after form completion or not
 */
class Forms {
  static autoMount = true
  static successMessage = true

  /**
   * @param {Object} props
   * @param {Boolean} [props.autoMount=true] - whether to auto mount forms
   * @param {Boolean|String} [props.successMessage=true] - whether to show success message after form completion or not
   */
  static assign(props) {
    if(props) {
      Object.entries(props).forEach(([key, value]) => {
        this[key] = value
      })
    }

    return this
  }

  static get shouldShowSuccessMessage() {
    return this.successMessage
  }
}

export { Forms }
