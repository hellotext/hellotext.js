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

  async index(params) {
    const url = new URL(this.url)

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url, {
      method: 'GET',
      headers: Hellotext.headers,
    })

    return response
  }

  async create(formData) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Hellotext.business.id}`,
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
