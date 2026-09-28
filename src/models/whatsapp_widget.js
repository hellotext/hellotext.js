import { Configuration } from '../core'

import API from '../api'
import { Business } from './business'

class WhatsAppWidget {
  static async load(id, { shouldMount = () => true } = {}) {
    const widget = new WhatsAppWidget({
      id,
      html: await API.whatsappWidgets.get(id),
    }, { shouldMount })

    widget.rendered = widget.render()

    return widget
  }

  constructor(data, { shouldMount = () => true } = {}) {
    this.data = data
    this.shouldMount = shouldMount
    this.mounted = false
    this.rendered = Promise.resolve(false)
  }

  async render() {
    if (!this.data.html) return false
    if (!this.shouldMount()) return false

    const container = this.containerToAppendTo
    if (!container) {
      console.warn(
        `Hellotext WhatsApp widget was not mounted because the container ${Configuration.whatsapp.container} was not found.`,
      )
      return false
    }

    if (!(await this.stylesheetLoaded)) {
      console.warn(
        'Hellotext WhatsApp widget was not mounted because its stylesheet failed to load.',
      )
      return false
    }

    if (!this.shouldMount()) return false

    container.appendChild(this.data.html)
    this.markCoexistingWidgets()
    this.mounted = true

    if (!this.shouldMount()) this.unmount()

    return this.mounted
  }

  unmount() {
    this.data.html?.remove()
    this.mounted = false
  }

  get containerToAppendTo() {
    try {
      return document.querySelector(Configuration.whatsapp.container)
    } catch (_) {
      return null
    }
  }

  get stylesheetLoaded() {
    return Business.waitForStylesheet(Business.latestStylesheet)
  }

  markCoexistingWidgets() {
    const webchat = document.querySelector('.hellotext--webchat:not(.hellotext--whatsapp-widget)')
    const whatsapp = this.data.html

    if (!webchat || !whatsapp) return

    webchat.classList.add('hellotext--with-whatsapp-widget')
    whatsapp.classList.add('hellotext--with-webchat')
  }
}

export { WhatsAppWidget }
