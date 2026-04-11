import { Cookies } from './cookies'

class User {
  static get id() {
    return Cookies.get('hello_user_id')
  }

  static get source() {
    return Cookies.get('hello_user_source')
  }

  static get fingerprint() {
    return Cookies.get('hello_user_identification_hash')
  }

  static remember(id, source, fingerprint) {
    if (source) {
      Cookies.set('hello_user_source', source)
    }

    if (fingerprint) {
      Cookies.set('hello_user_identification_hash', fingerprint)
    }

    Cookies.set('hello_user_id', id)
  }

  static forget() {
    Cookies.delete('hello_user_id')
    Cookies.delete('hello_user_source')
    Cookies.delete('hello_user_identification_hash')
  }

  static get identificationData() {
    if (!this.id) return {}

    return {
      id: this.id,
      source: this.source,
    }
  }
}

export { User }
