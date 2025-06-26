import API from '../api/businesses'

import locales from '../locales'

class Business {
  constructor(id) {
    this.id = id
    this.data = {}
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

  async fetchPublicData() {
    return API.get(this.id)
      .then(response => response.json())
      .then(data => {
        this.data = data

        if (typeof document !== 'undefined') {
          const linkTag = document.createElement('link')
          linkTag.rel = 'stylesheet'
          linkTag.href = data.style_url

          document.head.append(linkTag)
        }
      })
  }
}

export { Business }
