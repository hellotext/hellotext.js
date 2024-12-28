import Hellotext from '../hellotext';
import { Configuration } from '../core'

import API from '../api';

class WebChat {
  static async load(id) {
    return new WebChat(await API.webChats.get(id))
  }

  constructor(data) {
    this.data = data

    Hellotext.eventEmitter.dispatch('webchat:loaded', this)

    const container = document.querySelector(Configuration.webChat.container)
    container.appendChild(this.data)
  }
}

export { WebChat }