class Configuration {
  static apiRoot = 'https://api.hellotext.com/v1'
  static autoGenerateSession = true
  static autoMountForms = true

  static assign(props) {
    if(props) {
      Object.entries(props).forEach(([key, value]) => {
        this[key] = value
      })
    }

    return this
  }

  static endpoint(path) {
    return `${this.apiRoot}/${path}`
  }
}

export { Configuration }
