import { Configuration } from '../../core'
import Hellotext from '../../hellotext'

import { Response } from '../response'

class WebchatMessagesAPI {
  static get endpoint() {
    return Configuration.endpoint(`public/webchats/:id/messages`)
  }

  constructor(webchatId) {
    this.webchatId = webchatId
  }

  async index(params) {
    const url = new URL(this.url)

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    return await fetch(url, {
      method: 'GET',
      headers: Hellotext.headers,
    })
  }

  async create(formData) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Hellotext.business.id}`,
      },
      body: formData,
    })

    return new Response(response.ok, response)
  }

  markAsSeen(messageId = null) {
    const url = messageId ? this.url + `/${messageId}` : this.url + '/seen'

    fetch(url, {
      method: 'PATCH',
      headers: Hellotext.headers,
      body: JSON.stringify({
        session: Hellotext.session,
      }),
    })
  }

  get url() {
    return WebchatMessagesAPI.endpoint.replace(':id', this.webchatId)
  }
}

export default WebchatMessagesAPI
