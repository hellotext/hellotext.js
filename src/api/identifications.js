import Hellotext from '../hellotext'

import { Configuration } from '../core'
import { Response } from './response'

class IdentificationsAPI {
  static get endpoint() {
    return Configuration.endpoint('public/identifications')
  }

  static async create(data = {}) {
    const response = await fetch(this.endpoint, {
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

export default IdentificationsAPI
