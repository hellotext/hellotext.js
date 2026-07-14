/**
 * @typedef {'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'} Placement
 * @description Valid placements for the WhatsApp widget.
 */

/**
 * @enum {Placement}
 */
const placements = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right'
}

/**
 * @typedef {Object} WhatsAppWidgetAppearance
 * @property {Object} [launcher] - Launcher appearance overrides.
 * @property {string} [launcher.iconUrl] - Image URL used for the launcher icon.
 */

/**
 * @class WhatsApp
 * @classdesc Configuration for the standalone WhatsApp widget.
 * @property {String} id - The id of the WhatsApp widget.
 * @property {String} container - The container to append the widget to, defaults to 'body'.
 * @property {Placement} placement - The placement of the widget, defaults to 'bottom-right'.
 * @property {String} number - WhatsApp number used by the widget link.
 * @property {String} body - Prefilled WhatsApp compose text.
 * @property {WhatsAppWidgetAppearance} appearance - Appearance overrides.
 */
class WhatsApp {
  static _id
  static _container = 'body'
  static _placement = 'bottom-right'
  static _appearance = {}
  static _number = null
  static _body = null

  static set id(value) {
    this._id = value
  }

  static get id() {
    return this._id
  }

  static set container(value) {
    this._container = value
  }

  static get container() {
    return this._container
  }

  static set placement(value) {
    if (!Object.values(placements).includes(value)) {
      throw new Error(`Invalid placement value: ${value}`)
    }

    this._placement = value
  }

  static get placement() {
    return this._placement
  }

  static get appearance() {
    return this._appearance
  }

  static set appearance(value) {
    if (!this.isPlainObject(value)) {
      throw new Error('Appearance must be an object')
    }

    Object.entries(value).forEach(([key, nestedValue]) => {
      if (key !== 'launcher') {
        throw new Error(`Invalid appearance property: ${key}`)
      }

      if (!this.isPlainObject(nestedValue)) {
        throw new Error(`Appearance ${key} must be an object`)
      }

      Object.entries(nestedValue).forEach(([nestedKey, propertyValue]) => {
        if (nestedKey !== 'iconUrl') {
          throw new Error(`Invalid appearance launcher property: ${nestedKey}`)
        }

        if (propertyValue == null) {
          return
        }

        if (typeof propertyValue !== 'string') {
          throw new Error(`Invalid appearance ${key}.${nestedKey} value: ${propertyValue}`)
        }
      })
    })

    this._appearance = value
  }

  static get number() {
    return this._number
  }

  static set number(value) {
    if (value != null && typeof value !== 'string') {
      throw new Error(`Invalid number value: ${value}`)
    }

    this._number = value
  }

  static get body() {
    return this._body
  }

  static set body(value) {
    if (value != null && typeof value !== 'string') {
      throw new Error(`Invalid body value: ${value}`)
    }

    this._body = value
  }

  static assign(props) {
    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        this[key] = value
      })
    }

    return this
  }

  static isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }
}

export { WhatsApp }
