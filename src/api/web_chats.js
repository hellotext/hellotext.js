import Hellotext from '../hellotext'
import { Configuration } from '../core'

import { WebChat } from '../models';

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

    const data = response.json()

    return new WebChat(data)
  }
}
