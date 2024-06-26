class Configuration {
  static apiRoot = 'http://api.lvh.me:3000/v1/'
  static autoGenerateSession = true

  static assign({ apiRoot, autoGenerateSession }) {
    this.apiRoot = apiRoot || this.apiRoot
    this.autoGenerateSession = autoGenerateSession
    return this
  }

  static endpoint(path) {
    return `${this.apiRoot}/${path}`
  }
}

export { Configuration }
