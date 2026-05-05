/**
 * @jest-environment jsdom
 */

import WebchatsAPI from '../../src/api/webchats'
import Hellotext from '../../src/hellotext'
import { Configuration } from '../../src/core'

describe('WebchatsAPI', () => {
  beforeEach(() => {
    Configuration.webchat.style = {}
    Configuration.webchat.appearance = {}
    Configuration.webchat.whatsapp = {}
    Configuration.webchat.placement = 'bottom-right'

    Hellotext.business = {
      id: 'business-id',
      data: {},
    }

    jest.spyOn(Hellotext, 'session', 'get').mockReturnValue('session-123')

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        business: {},
        html: '<article data-webchat></article>',
        locale: 'en',
      }),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const requestedParams = async () => {
    await WebchatsAPI.get('webchat-id')

    return new URL(global.fetch.mock.calls[0][0]).searchParams
  }

  it('serializes appearance and WhatsApp overrides for the webchat request', async () => {
    Configuration.webchat.appearance = {
      header: {
        name: 'Acme Support',
      },
      launcher: {
        iconUrl: 'https://example.com/icon.png',
      },
    }
    Configuration.webchat.whatsapp = {
      number: '+15551234567',
      restrictToChannel: true,
    }

    const params = await requestedParams()

    expect(params.get('webchat[appearance][header][name]')).toBe('Acme Support')
    expect(params.get('webchat[appearance][launcher][icon_url]')).toBe('https://example.com/icon.png')
    expect(params.get('webchat[handoff][identifier]')).toBe('+15551234567')
    expect(params.get('webchat[handoff][restrict_to_channel]')).toBe('true')
  })

  it('serializes restrictToChannel when the supplied value is false', async () => {
    Configuration.webchat.whatsapp = {
      restrictToChannel: false,
    }

    const params = await requestedParams()

    expect(params.get('webchat[handoff][restrict_to_channel]')).toBe('false')
  })

  it('does not serialize absent appearance or WhatsApp overrides', async () => {
    const params = await requestedParams()

    expect(params.has('webchat[appearance][header][name]')).toBe(false)
    expect(params.has('webchat[appearance][launcher][icon_url]')).toBe(false)
    expect(params.has('webchat[handoff][identifier]')).toBe(false)
    expect(params.has('webchat[handoff][restrict_to_channel]')).toBe(false)
  })

  it('keeps existing style, placement, session, and locale params', async () => {
    Configuration.webchat.style = {
      primaryColor: '#EEEEEE',
      typography: 'inherit',
    }
    Configuration.webchat.placement = 'top-left'

    const params = await requestedParams()

    expect(params.get('style[primaryColor]')).toBe('#EEEEEE')
    expect(params.get('style[typography]')).toBe('inherit')
    expect(params.get('placement')).toBe('top-left')
    expect(params.get('session')).toBe('session-123')
    expect(params.get('locale')).toBe('en')
  })
})
