import { Configuration } from '../core'

import API from '../api'
import { Business } from './business'

class Webchat {
  static async load(id) {
    const webchat = new Webchat({
      id,
      html: await API.webchats.get(id),
    })

    webchat.rendered = webchat.render()

    return webchat
  }

  constructor(data) {
    this.data = data
    this.mounted = false
    this.unmounted = false
    this.rendered = Promise.resolve(false)
  }

  async render() {
    if (!this.data.html || this.unmounted) return false

    this.applyBehaviourOverride()

    if (!(await this.stylesheetLoaded) || this.unmounted) {
      if (this.unmounted) return false

      console.warn('Hellotext webchat was not mounted because its stylesheet failed to load.')
      return false
    }

    this.containerToAppendTo.appendChild(this.data.html)
    this.markCoexistingWidgets()
    this.mounted = true

    return true
  }

  unmount() {
    this.unmounted = true
    this.data.html?.remove()
    document
      .querySelector('.hellotext--whatsapp-widget')
      ?.classList.remove('hellotext--with-webchat')
    this.mounted = false
  }

  applyBehaviourOverride() {
    if (!Configuration.webchat.hasBehaviourOverride || !Configuration.webchat.behaviour) return

    this.data.html.setAttribute(
      'data-hellotext--webchat-behaviour-value',
      JSON.stringify(this.serializedBehaviour),
    )
  }

  get serializedBehaviour() {
    const behaviour = Configuration.webchat.behaviour

    return {
      trigger: this.serializeTrigger(behaviour.trigger),
      delay_seconds: behaviour.delaySeconds,
      first_visit_only: behaviour.firstVisitOnly,
      once_per_session: behaviour.oncePerSession,
    }
  }

  serializeTrigger(trigger) {
    if (trigger === 'onLoad') return 'on_load'
    if (trigger === 'onClick') return 'on_click'

    return trigger
  }

  get containerToAppendTo() {
    return document.querySelector(Configuration.webchat.container)
  }

  get stylesheetLoaded() {
    return Business.waitForStylesheet(Business.latestStylesheet)
  }

  markCoexistingWidgets() {
    const webchat = this.data.html
    const whatsapp = document.querySelector('.hellotext--whatsapp-widget')

    if (!webchat || !whatsapp) return

    webchat.classList.add('hellotext--with-whatsapp-widget')
    whatsapp.classList.add('hellotext--with-webchat')
  }
}

export { Webchat }
