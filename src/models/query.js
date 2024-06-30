import { Cookies } from './cookies'

class Query {
  static get inPreviewMode() {
    return new this().inPreviewMode
  }

  constructor() {
    this.urlSearchParams = new URLSearchParams(window.location.search)
  }

  get(param) {
    return this.urlSearchParams.get(this.toHellotextParam(param))
  }

  has(param) {
    return this.urlSearchParams.has(this.toHellotextParam(param))
  }

  get inPreviewMode() {
    return this.has('preview')
  }

  get session() {
    return this.get('session') || Cookies.get('hello_session')
  }

  toHellotextParam(param) {
    return `hello_${param}`
  }
}

export { Query }
