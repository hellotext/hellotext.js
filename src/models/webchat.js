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
    this.containerToAppendTo.appendChild(this.data.html)
  }

  get containerToAppendTo() {
    return document.querySelector(Configuration.webchat.container)
  }
}

export { Webchat }
