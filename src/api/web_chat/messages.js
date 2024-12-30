import Hellotext from '../../hellotext'
import { Configuration } from '../../core'

import { Response } from '../response'

class WebChatMessagesAPI {
  static get endpoint() {
    return Configuration.endpoint(`public/webchats/:id/messages`)
  }

  constructor(webChatId) {
    this.webChatId = webChatId
  }

  async create(params) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: Hellotext.headers,
      body: JSON.stringify({
        ...params,
        session: Hellotext.session,
      })
    })

    return new Response(response.ok, response)
  }

  get url() {
    return WebChatMessagesAPI.endpoint.replace(':id', this.webChatId)
  }
}

export default WebChatMessagesAPI
