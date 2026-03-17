import Hellotext from '../hellotext'

import { Configuration } from '../core'

class AcksAPI {
  static get endpoint() {
    return Configuration.endpoint('public/acks')
  }

  static async send() {
    const payload = {
      session: Hellotext.session,
      at: new Date().toISOString(),
    }

    fetch(this.endpoint, {
      method: 'POST',
      headers: Hellotext.headers,
      body: JSON.stringify(payload),
      keepalive: true,
    })
  }
}

export default AcksAPI
