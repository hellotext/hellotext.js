import locales from '../locales'

class Business {
  constructor(id) {
    this.id = id
    this.data = null
  }

  setData(data) {
    this.data = data

    if (typeof document !== 'undefined') {
      const linkTag = document.createElement('link')
      linkTag.rel = 'stylesheet'
      linkTag.href = data.style_url

      document.head.append(linkTag)
    }
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

  setLocale(locale) {
    if (!this.data) {
      this.data = {}
    }

    if (!locales[locale]) {
      return console.warn(`Locale ${locale} not found`)
    }

    this.data.locale = locale
  }

  get locale() {
    return locales[this.data.locale]
  }

  get features() {
    return this.data.features
  }
}

export { Business }
