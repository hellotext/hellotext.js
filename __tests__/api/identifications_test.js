/**
 * @jest-environment jsdom
 */

import IdentificationsAPI from '../../src/api/identifications'
import Hellotext from '../../src/hellotext'
import { Configuration } from '../../src/core'

describe('IdentificationsAPI', () => {
  beforeEach(() => {
    Configuration.apiRoot = 'https://api.hellotext.test/v1'
    Hellotext.business = { id: 'business-id' }
    jest.spyOn(Hellotext, 'session', 'get').mockReturnValue('session-123')
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ status: 'completed' }),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Configuration.apiRoot = 'https://api.hellotext.com/v1'
  })

  it('checks a receipt within the current business and session', async () => {
    const response = await IdentificationsAPI.status('receipt-1')
    const [request, options] = global.fetch.mock.calls[0]
    const url = new URL(request)

    expect(url.pathname).toBe('/v1/public/identifications/receipt-1')
    expect(url.search).toBe('')
    expect(options).toEqual({
      method: 'GET',
      headers: { ...Hellotext.headers, 'X-Hellotext-Session': 'session-123' },
    })
    expect(response.succeeded).toBe(true)
  })
})
