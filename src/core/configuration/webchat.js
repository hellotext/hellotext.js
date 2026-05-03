/**
 * @typedef {'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'} Placement
 * @description Valid placements for the webchat.
 */

/**
 * @enum {Placement}
 */
const placements = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right',
}

/**
 * @typedef {'absolute' | 'fixed'} Strategy
 * @description Valid strategies for the webchat.
 */

/**
 * @enum {Strategy}
 */

const strategies = {
  ABSOLUTE: 'absolute',
  FIXED: 'fixed',
}

/**
 * @typedef {'modal' | 'popover'} Mode
 */

/**
 * @enum {Mode}
 */
const modes = {
  MODAL: 'modal',
  POPOVER: 'popover',
}

/**
 * @typedef {Object} Style
 * @property {string} primaryColor - The primary webchat color (e.g., a hex code or color name).
 * @property {string} secondaryColor - The secondary webchat color or style (e.g., a hex code or color name).
 * @property {string} typography - The typography style (e.g., font family).
 */

/**
 * @class Webchat
 * @classdesc
 * Configuration for webchat
 * @property {String} id - the id of the webchat.
 * @property {String} container - the container to append the webchat to, defaults to 'body'
 * @property {Placement} placement - the placement of the webchat within the container, defaults to "bottom-right".
 * @property {String} classes - additional classes to apply to the webchat popup.
 * @property {String} triggerClasses - additional classes to apply to the webchat popup trigger.
 * @property {Mode} mode - how the webchat behaves while open, defaults to 'popover'.
 * @property {Object} behaviour - runtime opening behaviour for the webchat.
 * @property {Style} style - the style of the webchat.
 * @property {Strategy} strategy - the strategy used to position the webchat. Defaults to 'absolute'
 */

class Webchat {
  static _id
  static _container = 'body'
  static _placement = 'bottom-right'
  static _classes = []
  static _triggerClasses = []
  static _style = {}
  static _mode = modes.POPOVER
  static _behaviour = null
  static _hasBehaviourOverride = false
  static _strategy = null

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

  static set classes(value) {
    if (!Array.isArray(value) && typeof value !== 'string') {
      throw new Error('classes must be an array or a string')
    }

    this._classes = value
  }

  static get classes() {
    if (typeof this._classes === 'string') {
      return this._classes.split(',').map(c => c.trim())
    } else {
      return this._classes
    }
  }

  static set triggerClasses(value) {
    if (!Array.isArray(value) && typeof value !== 'string') {
      throw new Error('triggerClasses must be an array or a string')
    }

    this._triggerClasses = value
  }

  static get triggerClasses() {
    if (typeof this._triggerClasses === 'string') {
      return this._triggerClasses.split(',').map(c => c.trim())
    } else {
      return this._triggerClasses
    }
  }

  static set id(value) {
    this._id = value
  }

  static get id() {
    return this._id
  }

  static get isSet() {
    return !!this._id
  }

  static get style() {
    return this._style
  }

  static set style(value) {
    if (typeof value !== 'object') {
      throw new Error('Style must be an object')
    }

    Object.entries(value).forEach(([key, value]) => {
      if (!['primaryColor', 'secondaryColor', 'typography'].includes(key)) {
        throw new Error(`Invalid style property: ${key}`)
      }

      if (key === 'typography') {
        return
      }

      if (!this.isHexOrRgba(value)) {
        throw new Error(`Invalid color value: ${value} for ${key}. Colors must be hex or rgb/a.`)
      }
    })

    this._style = value
  }

  static get mode() {
    return this._mode
  }

  static set mode(value) {
    if (!Object.values(modes).includes(value)) {
      throw new Error(`Invalid mode value: ${value}`)
    }

    this._mode = value
  }

  static get behaviour() {
    return this._behaviour
  }

  static set behaviour(value) {
    if (value == null) {
      this._behaviour = value
      return
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`Invalid behaviour value: ${value}`)
    }

    this._behaviour = value
  }

  static get hasBehaviourOverride() {
    return this._hasBehaviourOverride
  }

  static set behaviourOverride(value) {
    this._hasBehaviourOverride = !!value
  }

  static get strategy() {
    if (this._strategy) {
      return this._strategy
    }

    return this.container == 'body' ? strategies.FIXED : strategies.ABSOLUTE
  }

  static set strategy(value) {
    if (value && !Object.values(strategies).includes(value)) {
      throw new Error(`Invalid strategy value: ${value}`)
    }

    this._strategy = value
  }

  static assign(props) {
    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        this[key] = value
      })
    }

    return this
  }

  static isHexOrRgba(value) {
    return (
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) ||
      /^rgba?\(\s*\d{1,3},\s*\d{1,3},\s*\d{1,3},?\s*(0|1|0?\.\d+)?\s*\)$/.test(value)
    )
  }
}

export { modes, Webchat }
