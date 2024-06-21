import Hellotext from '../hellotext'
import Response from './response'

export default class FormsAPI {
  static endpoint = 'http://api.lvh.me:3000/v1/public/forms'

  static async get(id) {
    return fetch(`${this.endpoint}/${id}`, {
      method: 'GET',
      headers: Hellotext.headers
    })
  }

  static async submit(id, data) {
    const response = await fetch(`${this.endpoint}/${id}/submissions`, {
      method: 'POST',
      headers: Hellotext.headers,
      body: JSON.stringify(data)
    })

    return new Response(response.ok, response)
  }
}
