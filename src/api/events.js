import Response from './response'

export default class EventsAPI {
  static endpoint = 'http://api.lvh.me:3000/v1/track/events'

  static async create({ headers, body }) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    return new Response(response.status === 200, await response.json())
  }
}
