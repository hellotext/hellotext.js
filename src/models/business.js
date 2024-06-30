import API from '../api/businesses'

import locales from '../locales'

class Business {
  constructor(id) {
    this.id = id
    this.data = {}
    this.fetchPublicData()
  }

  get subscription() {
    return this.data.subscription
  }

  get country() {
    return this.data.country
  }

  get enabledWhitelist() {
    return this.data.whitelist !== 'disabled'
  }

  get locale() {
    return locales[this.data.locale]
  }

  get features() {
    return this.data.features
  }

  // private

  fetchPublicData() {
    API.get(this.id)
      .then(response => response.json())
      .then(data => (this.data = data))
  }
}

export { Business }
