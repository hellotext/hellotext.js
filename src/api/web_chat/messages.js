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

  async create(formData) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        ...Hellotext.headers,
        'Content-Type': 'multipart/form-data',
      },
      body: formData
    })

    return new Response(response.ok, response)
  }

  get url() {
    return WebChatMessagesAPI.endpoint.replace(':id', this.webChatId)
  }
}

export default WebChatMessagesAPI
