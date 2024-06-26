export default class SessionsAPI {
  static endpoint = 'http://api.lvh.me:3000/v1/track/sessions'

  constructor(businessId) {
    this.businessId = businessId
  }

  async create() {
    const response = await fetch(SessionsAPI.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.businessId}`,
        Accept: 'application/json',
      }
    })

    return response.json()
  }
}
