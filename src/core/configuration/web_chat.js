/**
 * @typedef {'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'} Placement
 * @description Valid placements for the webchat.
 */

const placements = {
  TOP_LEFT: 'top-left',
  TOP_RIGHT: 'top-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_RIGHT: 'bottom-right'
}

/**
 * @class WebChat
 * @classdesc
 * Configuration for webchat
 * @property {String} container - the container to append the webchat to, defaults to 'body'
 * @property {Placement} placement - the placement of the webchat within the container, defaults to 'bottom-right'.
 * @property {String} classes - additional classes to apply to the webchat popup.
 * @property {String} triggerClasses - additional classes to apply to the webchat popup trigger.
 */

class WebChat {
  static _id
  static _container = 'body'
  static _placement = 'bottom-right'
  static _classes
  static _triggerClasses
  static _style = {}

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
    this._classes = value;
  }

  static get classes() {
    return this._classes;
  }

  static set triggerClasses(value) {
    this._triggerClasses = value;
  }

  static get triggerClasses() {
    return this._triggerClasses;
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

    this._style = value
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

export { WebChat, placements }
