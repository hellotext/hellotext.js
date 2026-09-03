import { Configuration } from '../core'

import API from '../api'
import { Business } from './business'

class Popup {
  static async load(id) {
    const popup = new Popup({
      id,
      html: await API.popups.get(id),
    })

    popup.rendered = popup.render()

    return popup
  }

  constructor(data) {
    this.data = data
    this.mounted = false
    this.unmounted = false
    this.rendered = Promise.resolve(false)
  }

  async render() {
    if (!this.data.html || this.unmounted) return false

    const container = this.containerToAppendTo
    if (!container) {
      console.warn(
        `Hellotext popup was not mounted because the container ${Configuration.popup.container} was not found.`,
      )
      return false
    }

    if (!(await this.stylesheetLoaded) || this.unmounted) {
      if (this.unmounted) return false

      console.warn('Hellotext popup was not mounted because its stylesheet failed to load.')
      return false
    }

    container.appendChild(this.data.html)
    this.mounted = true

    return true
  }

  unmount() {
    this.unmounted = true
    this.data.html?.remove()
    this.mounted = false
  }

  get containerToAppendTo() {
    try {
      return document.querySelector(Configuration.popup.container)
    } catch (_) {
      return null
    }
  }

  get stylesheetLoaded() {
    return Business.waitForStylesheet(Business.latestStylesheet)
  }
}

export { Popup }
