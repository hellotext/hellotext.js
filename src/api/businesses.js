export default class {
  static endpoint = 'http://api.lvh.me:3000/v1/public/businesses'

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
