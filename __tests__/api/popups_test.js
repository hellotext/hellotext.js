/**
 * @jest-environment jsdom
 */

import PopupsAPI from '../../src/api/popups'
import Hellotext from '../../src/hellotext'
import { Configuration } from '../../src/core'
import { Locale } from '../../src/core/configuration/locale'

describe('PopupsAPI', () => {
  beforeEach(() => {
    Configuration.apiRoot = 'https://api.hellotext.test/v1'
    Configuration.popup.device = 'desktop'
    Locale._identifier = 'es'
    Hellotext.business = {
      id: 'business-id',
      data: null,
      setData: jest.fn(),
      setLocale: jest.fn(),
    }

    jest.spyOn(Hellotext, 'session', 'get').mockReturnValue('session-123')
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        business: { id: 'business-id' },
        html: '<article id="popup-widget" data-controller="hellotext--popup"></article>',
        locale: 'es',
      }),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Configuration.apiRoot = 'https://api.hellotext.com/v1'
    Configuration.popup.id = undefined
    Configuration.popup.container = 'body'
    Configuration.popup.device = 'auto'
    Locale._identifier = undefined
  })

  it('fetches the public popup with session, locale, and device params', async () => {
    const element = await PopupsAPI.get('popup-id')
    const url = new URL(global.fetch.mock.calls[0][0])

    expect(url.pathname).toBe('/v1/public/popups/popup-id')
    expect(url.searchParams.get('session')).toBe('session-123')
    expect(url.searchParams.get('locale')).toBe('es')
    expect(url.searchParams.get('device')).toBe('desktop')
    expect(global.fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer business-id')
    expect(element.id).toBe('popup-widget')
    expect(Hellotext.business.setData).toHaveBeenCalledWith({ id: 'business-id' })
    expect(Hellotext.business.setLocale).toHaveBeenCalledWith('es')
  })

  it('returns null when the popup request fails', async () => {
    global.fetch.mockResolvedValue({ ok: false })

    await expect(PopupsAPI.get('popup-id')).resolves.toBeNull()
  })

  it('returns null when the popup request errors', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'))

    await expect(PopupsAPI.get('popup-id')).resolves.toBeNull()
  })

  it('returns null when the popup response is invalid JSON', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    })

    await expect(PopupsAPI.get('popup-id')).resolves.toBeNull()
  })

  it('submits popup data with the current session', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: 'submission-id' }),
    })

    const response = await PopupsAPI.submit(
      'popup-id',
      {
        email: 'customer@example.com',
        metadata: { fields: { email: 'customer@example.com' } },
      },
      'submission-key',
    )

    const request = global.fetch.mock.calls[0]
    const body = JSON.parse(request[1].body)

    expect(request[0]).toBe('https://api.hellotext.test/v1/public/popups/popup-id/submissions')
    expect(request[1].method).toBe('POST')
    expect(request[1].headers.Authorization).toBe('Bearer business-id')
    expect(request[1].headers['Idempotency-Key']).toBe('submission-key')
    expect(body).toEqual({
      session: 'session-123',
      popup_submission: {
        email: 'customer@example.com',
        metadata: {
          fields: {
            email: 'customer@example.com',
          },
        },
      },
    })
    expect(response.succeeded).toBe(true)
  })

  it('returns a failed response when the submission request errors', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'))

    const response = await PopupsAPI.submit('popup-id', { email: 'customer@example.com' }, 'submission-key')

    expect(response.failed).toBe(true)
    await expect(response.json()).resolves.toEqual({ errors: [] })
  })
})
