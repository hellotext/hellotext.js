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
    url.searchParams.append('device', this.runtimeDevice)

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

  static async submit(id, data, idempotencyKey = this.idempotencyKey()) {
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
  }

  static async resend(id, submissionId, token) {
    const response = await fetch(`${this.endpoint}/${id}/submissions/${submissionId}/resend`, {
      method: 'POST',
      headers: Hellotext.headers,
      body: JSON.stringify({ token }),
    })

    return new Response(response.ok, response)
  }

  static async cancel(id, submissionId, token) {
    const response = await fetch(`${this.endpoint}/${id}/submissions/${submissionId}/cancel`, {
      method: 'POST',
      headers: Hellotext.headers,
      body: JSON.stringify({ token }),
    })

    return new Response(response.ok, response)
  }

  static idempotencyKey() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
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

  static get runtimeDevice() {
    if (Configuration.popup.device !== 'auto') return Configuration.popup.device

    return window.innerWidth <= 767 ? 'mobile' : 'desktop'
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
