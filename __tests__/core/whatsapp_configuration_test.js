import { WhatsApp } from '../../src/core'

describe('WhatsApp configuration', () => {
  afterEach(() => {
    WhatsApp.id = undefined
    WhatsApp.container = 'body'
    WhatsApp.placement = 'bottom-right'
    WhatsApp.appearance = {}
    WhatsApp.number = null
    WhatsApp.body = null
  })

  it('assigns valid widget options', () => {
    WhatsApp.assign({
      id: 'widget-id',
      container: '#widget-container',
      placement: 'top-left',
      appearance: {
        launcher: {
          iconUrl: 'https://example.com/whatsapp.png'
        }
      },
      number: '+15551234567',
      body: 'Hello from install'
    })

    expect(WhatsApp.id).toBe('widget-id')
    expect(WhatsApp.container).toBe('#widget-container')
    expect(WhatsApp.placement).toBe('top-left')
    expect(WhatsApp.appearance.launcher.iconUrl).toBe('https://example.com/whatsapp.png')
    expect(WhatsApp.number).toBe('+15551234567')
    expect(WhatsApp.body).toBe('Hello from install')
  })

  it('rejects invalid launcher appearance keys', () => {
    expect(() => {
      WhatsApp.appearance = {
        launcher: {
          color: '#25D366'
        }
      }
    }).toThrow('Invalid appearance launcher property: color')
  })
})
