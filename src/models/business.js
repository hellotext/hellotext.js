import API from '../api/businesses'

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

  // private

  fetchPublicData() {
    API.get(this.id).then(response => response.json()).then(data => this.data = data)
  }
}

export { Business }
