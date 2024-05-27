import API from '../api'

export default class {
  static root = API.root + '/v1/track/sessions'

  constructor(businessId) {
    this.businessId = businessId
  }

  async create() {
    const response = await fetch(this.root, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.businessId}`,
        Accept: 'application/json',
      }
    })

    return response.json()
  }
}
