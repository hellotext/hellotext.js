import { Cookies } from './cookies'

class User {
  static get id() {
    return Cookies.get('hello_user_id')
  }

  static get source() {
    return Cookies.get('hello_user_source')
  }

  static remember(id, source) {
    if (source) {
      Cookies.set('hello_user_source', source)
    }

    Cookies.set('hello_user_id', id)
  }

  static forget() {
    Cookies.delete('hello_user_id')
    Cookies.delete('hello_user_source')
  }

  static get identificationData() {
    if (!this.id) return {}

    return {
      user_id: this.id,
      source: this.source,
    }
  }
}

export { User }
