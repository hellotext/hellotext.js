import { Configuration, Locale } from '../core'
import Hellotext from '../hellotext'

class WebchatsAPI {
  static get endpoint() {
    return Configuration.endpoint('public/webchats')
  }

  static async get(id) {
    const url = new URL(`${this.endpoint}/${id}`)

    url.searchParams.append('session', Hellotext.session)
    url.searchParams.append('locale', Locale.toString())

    Object.entries(Configuration.webchat.style).forEach(([key, value]) => {
      url.searchParams.append(`style[${key}]`, value)
    })

    this.appendWebchatOverrides(url)

    url.searchParams.append('placement', Configuration.webchat.placement)

    const response = await fetch(url, {
      method: 'GET',
      headers: Hellotext.headers,
    })

    const data = await response.json()

    if (!Hellotext.business.data) {
      Hellotext.business.setData(data.business)
      Hellotext.business.setLocale(data.locale)
    }

    return new DOMParser().parseFromString(data.html, 'text/html').querySelector('article')
  }

  static appendWebchatOverrides(url) {
    const { appearance, whatsapp } = Configuration.webchat

    this.appendIfSupplied(url, 'webchat[appearance][header][name]', appearance.header?.name)
    this.appendIfSupplied(url, 'webchat[appearance][launcher][icon_url]', appearance.launcher?.iconUrl)
    this.appendIfSupplied(url, 'webchat[handoff][identifier]', whatsapp.number)
    this.appendIfSupplied(url, 'webchat[handoff][restrict_to_channel]', whatsapp.restrictToChannel)
  }

  static appendIfSupplied(url, key, value) {
    if (value === undefined || value === null) return

    url.searchParams.append(key, String(value))
  }
}

export default WebchatsAPI
