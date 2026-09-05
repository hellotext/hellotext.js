import { Configuration } from '../core'

import API from '../api'

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
    this.rendered = Promise.resolve(false)
  }

  async render() {
    if (!this.data.html) return false

    const container = this.containerToAppendTo
    if (!container) {
      console.warn(
        `Hellotext popup was not mounted because the container ${Configuration.popup.container} was not found.`,
      )
      return false
    }

    container.appendChild(this.data.html)
    this.mounted = true

    return true
  }

  get containerToAppendTo() {
    try {
      return document.querySelector(Configuration.popup.container)
    } catch (_) {
      return null
    }
  }
}

export { Popup }
