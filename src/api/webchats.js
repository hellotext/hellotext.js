import { Configuration } from '../core'
import Hellotext from '../hellotext'

class WebchatsAPI {
  static get endpoint() {
    return Configuration.endpoint('public/webchats')
  }

  static async get(id) {
    const url = new URL(`${this.endpoint}/${id}`)

    url.searchParams.append('session', Hellotext.session)

    Object.entries(Configuration.webchat.style).forEach(([key, value]) => {
      url.searchParams.append(`style[${key}]`, value)
    })

    url.searchParams.append('placement', Configuration.webchat.placement)

    const response = await fetch(url, {
      method: 'GET',
      headers: Hellotext.headers,
    })

    const data = await response.json()

    if (!Hellotext.business.data) {
      Hellotext.business.setData(data.business)
    }

    return new DOMParser().parseFromString(data.html, 'text/html').querySelector('article')
  }
}

export default WebchatsAPI
