import { Configuration } from '../core'

import { Query } from '../models'
import { Response } from './response'

export default class EventsAPI {
  static get endpoint() {
    return Configuration.endpoint('track/events')
  }

  static async create({ headers, body }) {
    if (Query.inPreviewMode) {
      return new Response(true, { received: true })
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    return new Response(response.status === 200, await response.json())
  }
}
