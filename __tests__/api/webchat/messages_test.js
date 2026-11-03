/**
 * @jest-environment jsdom
 */

import WebchatMessagesAPI from '../../../src/api/webchat/messages'
import Hellotext from '../../../src/hellotext'

describe('WebchatMessagesAPI', () => {
  beforeEach(() => {
    Hellotext.business = { id: 'business-id' }
    jest.spyOn(Hellotext, 'session', 'get').mockReturnValue('session-123')

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ messages: [] }),
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Hellotext.page = undefined
  })

  it('sends the page the message is sent from', async () => {
    Hellotext.page = {
      trackingData: {
        page: { url: 'https://shop.example.test/products/shirt', title: 'Shirt', path: '/products/shirt', section: 'product_details' },
      },
    }
    const formData = new FormData()
    formData.append('message[body]', 'Hello')

    await new WebchatMessagesAPI('webchat-id').create(formData)

    const body = global.fetch.mock.calls[0][1].body
    expect(body.get('message[body]')).toBe('Hello')
    expect(body.get('message[page][url]')).toBe('https://shop.example.test/products/shirt')
    expect(body.get('message[page][title]')).toBe('Shirt')
    expect(body.get('message[page][path]')).toBe('/products/shirt')
    expect(body.get('message[page][section]')).toBe('product_details')
  })

  it('requests catch-up messages after the supplied message id', async () => {
    const api = new WebchatMessagesAPI('webchat-id')

    await api.catchUp('message-123')

    const url = new URL(global.fetch.mock.calls[0][0])

    expect(url.pathname).toBe('/v1/public/webchats/webchat-id/messages')
    expect(url.searchParams.get('after_id')).toBe('message-123')
    expect(url.searchParams.get('session')).toBe('session-123')
  })
})
