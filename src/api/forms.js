import Hellotext from '../hellotext'
import API from '../api'

export default class extends API {
  static root = super.root + '/v1/public/forms'

  static async get(id) {
    return fetch(`${this.root}/${id}`, {
      method: 'GET',
      headers: Hellotext.headers
    })
  }
}
