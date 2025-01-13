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
  BOTTOM_RIGHT: 'bottom-right'
}


/**
 * @typedef {'modal' | 'popover'} Behaviour
 */

/**
 * @enum {Behaviour}
 */
const behaviors = {
  MODAL: 'modal',
  POPOVER: 'popover'
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
 * @property {Behaviour} behaviour - the behaviour of the webchat, defaults to 'popover'.
 * @property {Style} style - the style of the webchat.
 */

class Webchat {
  static _id
  static _container = 'body'
  static _placement = 'bottom-right'
  static _classes = []
  static _triggerClasses = []
  static _style = {}
  static _behaviour = behaviors.POPOVER

  static set container(value) {
    this._container = value
  }

  static get container() {
    return this._container
  }

  static set placement(value) {
    if(!Object.values(placements).includes(value)) {
      throw new Error(`Invalid placement value: ${value}`)
    }

    this._placement = value
  }

  static get placement() {
    return this._placement
  }

  static set classes(value) {
    if(!Array.isArray(value) && typeof value !== 'string') {
      throw new Error('classes must be an array or a string')
    }

    this._classes = value;
  }

  static get classes() {
    if(typeof this._classes === 'string') {
      return this._classes.split(',').map(c => c.trim())
    } else {
      return this._classes;
    }
  }

  static set triggerClasses(value) {
    if(!Array.isArray(value) && typeof value !== 'string') {
      throw new Error('triggerClasses must be an array or a string')
    }

    this._triggerClasses = value;
  }

  static get triggerClasses() {
    if(typeof this._triggerClasses === 'string') {
      return this._triggerClasses.split(',').map(c => c.trim())
    } else {
      return this._triggerClasses;
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
    if(typeof value !== 'object') {
      throw new Error('Style must be an object')
    }

    Object.keys(value).forEach(key => {
      if(!['primaryColor', 'secondaryColor', 'typography'].includes(key)) {
        throw new Error(`Invalid style key: ${key}`)
      }
    })

    this._style = value
  }

  static get behaviour() {
    return this._behaviour
  }

  static set behaviour(value) {
    if(!Object.values(behaviors).includes(value)) {
      throw new Error(`Invalid behaviour value: ${value}`)
    }

    this._behaviour = value
  }

  static assign(props) {
    if(props) {
      Object.entries(props).forEach(([key, value]) => {
        this[key] = value
      })
    }

    return this
  }
}

export { Webchat, behaviors }
