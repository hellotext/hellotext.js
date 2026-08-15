import { Configuration, Locale } from '../core'
import Hellotext from '../hellotext'

import { Response } from './response'

class PopupsAPI {
  static get endpoint() {
    return Configuration.endpoint('public/popups')
  }

  static async get(id) {
    const url = new URL(`${this.endpoint}/${id}`)

    url.searchParams.append('session', Hellotext.session)
    url.searchParams.append('locale', Locale.toString())
    url.searchParams.append('device', Configuration.popup.device)

    const response = await this.fetchPopup(url)

    if (!response.ok) return null

    const data = await this.parsePopupResponse(response)

    if (!data) return null

    if (!Hellotext.business.data) {
      Hellotext.business.setData(data.business)
      Hellotext.business.setLocale(data.locale)
    }

    return new DOMParser().parseFromString(data.html, 'text/html').querySelector('article')
  }

  static async submit(id, data, idempotencyKey) {
    try {
      const response = await fetch(`${this.endpoint}/${id}/submissions`, {
        method: 'POST',
        headers: {
          ...Hellotext.headers,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          session: Hellotext.session,
          popup_submission: data,
        }),
      })

      return new Response(response.ok, response)
    } catch (_) {
      return new Response(false, {
        status: 0,
        json: async () => ({ errors: [] }),
      })
    }
  }

  static async fetchPopup(url) {
    try {
      return await fetch(url, {
        method: 'GET',
        headers: Hellotext.headers,
      })
    } catch (_) {
      return { ok: false }
    }
  }

  static async parsePopupResponse(response) {
    try {
      return await response.json()
    } catch (_) {
      return null
    }
  }
}

export default PopupsAPI
