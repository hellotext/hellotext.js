import Hellotext from '../hellotext'

export default class FormsAPI {
  static endpoint = 'http://api.lvh.me:3000/v1/public/forms'

  static async get(id) {
    return fetch(`${this.endpoint}/${id}`, {
      method: 'GET',
      headers: Hellotext.headers
    })
  }
}

class SubmissionsAPI {
  static endpoint = `http://api.lvh.me:3000/v1/public/forms/:form_id/submissions`
}

export { SubmissionsAPI }
