import { Configuration } from '../core'

export default class SessionsAPI {
  static get endpoint() {
    return Configuration.endpoint('track/sessions')
  }

  constructor(businessId) {
    this.businessId = businessId
  }

  async create() {
    const response = await fetch(SessionsAPI.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.businessId}`,
        Accept: 'application/json',
      },
    })

    return response.json()
  }
}
