/**
 * @jest-environment jsdom
 */

import AcksAPI from '../../src/api/acks'
import Hellotext from '../../src/hellotext'
import { Configuration } from '../../src/core'

describe('AcksAPI', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-19T12:00:00.000Z'))

    Configuration.apiRoot = 'https://api.hellotext.test/v1'
    Hellotext.business = {
      id: 'business-id',
    }

    jest.spyOn(Hellotext, 'session', 'get').mockReturnValue('session-123')

    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    Configuration.apiRoot = 'https://api.hellotext.com/v1'
  })

  it('posts the supplied UTM params with the session ack payload', async () => {
    await AcksAPI.send({
      utm_params: {
        source: 'google',
        medium: 'cpc',
        campaign: 'summer-sale',
        term: 'sandals',
        content: 'hero-button',
      },
    })

    expect(global.fetch).toHaveBeenCalledWith('https://api.hellotext.test/v1/public/acks', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer business-id',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        utm_params: {
          source: 'google',
          medium: 'cpc',
          campaign: 'summer-sale',
          term: 'sandals',
          content: 'hero-button',
        },
        session: 'session-123',
        at: '2026-06-19T12:00:00.000Z',
      }),
      keepalive: true,
    })
  })

  it('keeps the current SDK session and timestamp authoritative over supplied params', async () => {
    await AcksAPI.send({
      session: 'stale-session',
      at: '2020-01-01T00:00:00.000Z',
      utm_params: {
        source: 'facebook',
        medium: 'social',
      },
    })

    const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body)

    expect(requestBody).toEqual({
      session: 'session-123',
      at: '2026-06-19T12:00:00.000Z',
      utm_params: {
        source: 'facebook',
        medium: 'social',
      },
    })
  })
})
