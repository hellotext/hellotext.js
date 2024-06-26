import { Configuration } from '../core'

export default class {
  static get endpoint() {
    return Configuration.endpoint('public/businesses')
  }

  static async get(id) {
    return fetch(`${this.endpoint}/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${id}`,
        Accept: 'application.json',
        'Content-Type': 'application/json',
      }
    })
  }
}
