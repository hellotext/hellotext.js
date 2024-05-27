import Hellotext from '../hellotext'

class Business {
  constructor(id) {
    this.id = id
    this.data = {}
    this.fetchPublicData()
  }

  get subscription() {
    return this.data.subscription
  }

  get enabledWhitelist() {
    return this.data.whitelist !== 'disabled'
  }

  fetchPublicData() {
    fetch(Hellotext.__apiURL + 'public/businesses/' + this.id, { headers: this.headers })
      .then(response => response.json())
      .then(data => this.data = data)
  }

  get headers() {
    return {
      Authorization: `Bearer ${this.id}`,
      Accept: 'application.json',
      'Content-Type': 'application/json',
    }
  }
}

export { Business }
