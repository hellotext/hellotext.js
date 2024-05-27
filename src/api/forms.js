import Hellotext from '../hellotext'

export default class FormsAPI {
  static root = 'http://api.lvh.me:3000/v1/public/forms'

  static async get(id) {
    return fetch(`${this.root}/${id}`, {
      method: 'GET',
      headers: Hellotext.headers
    })
  }
}
