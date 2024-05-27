import API from '../api'

export default class extends API {
  static root = super.root + '/v1/public/businesses'

  static async get(id) {
    return fetch(`${this.root}/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${id}`,
        Accept: 'application.json',
        'Content-Type': 'application/json',
      }
    })
  }
}
