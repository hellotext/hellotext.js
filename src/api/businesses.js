import { Configuration } from '../core'

export default class {
  static endpoint(apiRoot = Configuration.apiRoot) {
    return `${apiRoot}/public/businesses`
  }

  static async get(id, apiRoot) {
    return fetch(`${this.endpoint(apiRoot)}/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${id}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
  }
}
