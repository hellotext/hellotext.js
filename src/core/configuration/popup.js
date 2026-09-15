/**
 * @typedef {'auto' | 'mobile' | 'desktop'} PopupDevice
 * @description Runtime device override for popup loading.
 */

/**
 * @class Popup
 * @classdesc Configuration for dashboard popups.
 * @property {String} id - The popup id.
 * @property {String} container - The container to append the popup to, defaults to 'body'.
 * @property {PopupDevice} device - Runtime device preference, defaults to 'auto'.
 */
class Popup {
  static _id
  static _container = 'body'
  static _device = 'auto'

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

  static set device(value) {
    if (!['auto', 'mobile', 'desktop'].includes(value)) {
      throw new Error(`Invalid popup device value: ${value}`)
    }

    this._device = value
  }

  static get device() {
    return this._device
  }

  static assign(props) {
    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        this[key] = value
      })
    }

    return this
  }
}

export { Popup }
