import { Cookies } from './cookies'

class UTM {
  constructor() {
    const urlSearchParams = new URLSearchParams(window.location.search)

    const utmsFromUrl = {
      source: urlSearchParams.get('utm_source'),
      medium: urlSearchParams.get('utm_medium'),
      campaign: urlSearchParams.get('utm_campaign'),
      term: urlSearchParams.get('utm_term'),
      content: urlSearchParams.get('utm_content'),
    }

    if (utmsFromUrl.source && utmsFromUrl.medium) {
      const cleanUtms = Object.fromEntries(
        Object.entries(utmsFromUrl).filter(([_, value]) => value),
      )

      Cookies.set('hello_utm', JSON.stringify(cleanUtms))
    }
  }

  get current() {
    try {
      return JSON.parse(Cookies.get('hello_utm')) || {}
    } catch (e) {
      return {}
    }
  }
}

export { UTM }
