import API from '../api';

class WebChat {
  static async load(id) {
    return new WebChat(await API.webChats.get(id))
  }

  constructor(data) {
    this.data = data
  }
}

export { WebChat }
