/**
 * @jest-environment jsdom
 */

import API from '../../../src/api'
import Hellotext from '../../../src/hellotext'
import { Configuration } from '../../../src/core'

describe('PushIdentitiesAPI', () => {
  const defaultApiRoot = Configuration.apiRoot
  const subscription = {
    endpoint: 'https://push.example.com/subscription',
    expirationTime: null,
    keys: {
      p256dh: 'encryption-key',
      auth: 'authentication-secret',
    },
  }

  beforeEach(() => {
    Configuration.apiRoot = 'https://api.hellotext.test/v1'
    Hellotext.business = { id: 'business-id' }
    jest.spyOn(Hellotext, 'session', 'get').mockReturnValue('session-123')

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ id: 'identity-id' }),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Configuration.apiRoot = defaultApiRoot
  })

  it('posts the subscription with the current session and storefront origin', async () => {
    const response = await API.pushIdentities.create({
      subscription,
      channel_id: 'channel-id',
      session: 'stale-session',
      origin: 'https://other.example.com',
    })

    expect(global.fetch).toHaveBeenCalledWith('https://api.hellotext.test/v1/public/push/identities', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer business-id',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        channel_id: 'channel-id',
        session: 'session-123',
        origin: window.location.origin,
      }),
    })
    expect(response.succeeded).toBe(true)
    await expect(response.json()).resolves.toEqual({ id: 'identity-id' })
  })

  it('deletes the identity with its subscription and current session and origin', async () => {
    const response = await API.pushIdentities.destroy({
      subscription,
      session: 'stale-session',
      origin: 'https://other.example.com',
    })

    expect(global.fetch).toHaveBeenCalledWith('https://api.hellotext.test/v1/public/push/identities', {
      method: 'DELETE',
      headers: {
        Authorization: 'Bearer business-id',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        session: 'session-123',
        origin: window.location.origin,
      }),
    })
    expect(response.succeeded).toBe(true)
  })

  it.each([
    ['create', [{ subscription }]],
    ['destroy', [{ subscription }]],
  ])('returns a failed response when %s is rejected', async (method, args) => {
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'invalid subscription' }),
    })

    const response = await API.pushIdentities[method](...args)

    expect(response.failed).toBe(true)
    await expect(response.json()).resolves.toEqual({ error: 'invalid subscription' })
  })
})
