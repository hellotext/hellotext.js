import API from '../../../src/api'
import Hellotext from '../../../src/hellotext'
import { Configuration } from '../../../src/core'

describe('PushAlertsAPI', () => {
  const defaultApiRoot = Configuration.apiRoot
  let previousBusiness

  beforeEach(() => {
    previousBusiness = Hellotext.business
    Configuration.apiRoot = 'https://api.hellotext.test/v1'
    Hellotext.business = { id: 'business-id' }
    jest.spyOn(Hellotext, 'session', 'get').mockReturnValue('session-id')
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 204 })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Configuration.apiRoot = defaultApiRoot
    Hellotext.business = previousBusiness
  })

  it.each(['shown', 'dismissed', 'accepted'])('posts %s with the current session, section, and page', async kind => {
    const page = { url: 'https://shop.example.com/?utm_source=email#offers', title: 'Shop', path: '/' }
    const response = await API.pushAlerts.create({ section: 'homepage', kind, page })

    expect(global.fetch).toHaveBeenCalledWith('https://api.hellotext.test/v1/public/push/alerts', {
      method: 'POST',
      keepalive: true,
      headers: {
        Authorization: 'Bearer business-id',
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session: 'session-id', section: 'homepage', kind, page }),
    })
    expect(response.succeeded).toBe(true)
  })

  it('uses the latest SDK session for each request', async () => {
    await API.pushAlerts.create({ section: 'homepage', kind: 'shown' })
    jest.spyOn(Hellotext, 'session', 'get').mockReturnValue('next-session-id')
    await API.pushAlerts.create({ section: 'product_details', kind: 'accepted' })

    expect(JSON.parse(global.fetch.mock.calls[1][1].body)).toEqual({
      session: 'next-session-id',
      section: 'product_details',
      kind: 'accepted',
    })
  })

  it('returns a failed response when the endpoint rejects the interaction', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 422 })

    const response = await API.pushAlerts.create({ section: 'homepage', kind: 'shown' })

    expect(response.failed).toBe(true)
  })
})
