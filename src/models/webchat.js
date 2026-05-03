import { Configuration } from '../core'

import API from '../api'

class Webchat {
  static async load(id) {
    return new Webchat({
      id,
      html: await API.webchats.get(id),
    })
  }

  constructor(data) {
    this.data = data
    this.render()
  }

  render() {
    this.applyBehaviourOverride()
    this.containerToAppendTo.appendChild(this.data.html)
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
}

export { Webchat }
