/**
 * @jest-environment jsdom
 */

import WhatsAppWidgetsAPI from '../../src/api/whatsapp_widgets'
import Hellotext from '../../src/hellotext'
import { Configuration } from '../../src/core'

describe('WhatsAppWidgetsAPI', () => {
  beforeEach(() => {
    Configuration.apiRoot = 'https://api.hellotext.test/v1'
    Configuration.whatsapp.placement = 'top-left'
    Configuration.whatsapp.appearance = {
      launcher: {
        iconUrl: 'https://example.com/whatsapp.png'
      }
    }

    Configuration.whatsapp.number = '+15551234567'
    Configuration.whatsapp.body = 'Hello from install'
    Hellotext.business = {
      id: 'business-id',
      data: { id: 'business-id' },
      setData: jest.fn(),
      setLocale: jest.fn()
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        business: { id: 'business-id' },
        html: '<article id="whatsapp-widget"></article>'
      })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Configuration.apiRoot = 'https://api.hellotext.com/v1'
    Configuration.whatsapp.placement = 'bottom-right'
    Configuration.whatsapp.appearance = {}
    Configuration.whatsapp.number = null
    Configuration.whatsapp.body = null
  })

  it('fetches the public WhatsApp widget with placement, appearance, number, and body overrides', () => {
    return WhatsAppWidgetsAPI.get('widget-id').then(element => {
      const url = new URL(global.fetch.mock.calls[0][0])

      expect(url.pathname).toBe('/v1/public/widgets/whatsapp/widget-id')
      expect(url.searchParams.get('placement')).toBe('top-left')
      expect(url.searchParams.get('whatsapp[appearance][launcher][icon_url]')).toBe('https://example.com/whatsapp.png')
      expect(url.searchParams.get('whatsapp[number]')).toBe('+15551234567')
      expect(url.searchParams.get('whatsapp[body]')).toBe('Hello from install')
      expect(element.id).toBe('whatsapp-widget')
    })
  })

  it('returns null when the widget request fails', () => {
    global.fetch.mockResolvedValue({ ok: false })

    return WhatsAppWidgetsAPI.get('widget-id').then(element => {
      expect(element).toBeNull()
    })
  })

  it('returns null when the widget request errors', () => {
    global.fetch.mockRejectedValue(new Error('Network error'))

    return WhatsAppWidgetsAPI.get('widget-id').then(element => {
      expect(element).toBeNull()
    })
  })

  it('returns null when the widget response is invalid JSON', () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    })

    return WhatsAppWidgetsAPI.get('widget-id').then(element => {
      expect(element).toBeNull()
    })
  })
})
