import Hellotext from '../hellotext'
import { Configuration } from '../core'

import { Response } from './response'

export default class FormsAPI {
  static get endpoint() {
    return Configuration.endpoint('public/forms')
  }

  static async get(id) {
    const url = new URL(`${this.endpoint}/${id}`)
    url.searchParams.append('session', Hellotext.session)

    return fetch(url, {
      method: 'GET',
      headers: Hellotext.headers,
    })
  }

  static async submit(id, data) {
    const response = await fetch(`${this.endpoint}/${id}/submissions`, {
      method: 'POST',
      headers: Hellotext.headers,
      body: JSON.stringify({
        session: Hellotext.session,
        ...data,
      }),
    })

    return new Response(response.ok, response)
  }
}
