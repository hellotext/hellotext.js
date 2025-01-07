import Hellotext from '../hellotext';
import { Configuration } from '../core'

import API from '../api';

class WebChat {
  static async load(id) {
    return new WebChat({
      id,
      html: await API.webChats.get(id),
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
    return document.querySelector(Configuration.webChat.container)
  }
}

export { WebChat }
