import Hellotext from '../hellotext'
import { Configuration } from '../core'

class WebChatsAPI {
  static get endpoint() {
    return Configuration.endpoint('public/webchats')
  }

  static async get(id) {
    const url = new URL(`${this.endpoint}/${id}`)
    url.searchParams.append('session', Hellotext.session)

    const response = await fetch(url, {
      method: 'GET',
      headers: Hellotext.headers,
    })

    const htmlText = await response.text()
    return (new DOMParser()).parseFromString(htmlText, "text/html").querySelector('article');
  }
}

export default WebChatsAPI
