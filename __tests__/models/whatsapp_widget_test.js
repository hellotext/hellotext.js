/**
 * @jest-environment jsdom
 */

import API from '../../src/api'
import { Configuration } from '../../src/core'
import { WhatsAppWidget } from '../../src/models'

describe('WhatsAppWidget', () => {
  const createStylesheet = ({ loaded = true } = {}) => {
    const linkTag = document.createElement('link')
    linkTag.rel = 'stylesheet'
    linkTag.href = 'https://example.com/hellotext.css'
    linkTag.setAttribute('data-hellotext-stylesheet', 'true')

    if (loaded) {
      linkTag.dataset.hellotextStylesheetLoaded = 'true'
    }

    document.head.appendChild(linkTag)

    return linkTag
  }

  const markStylesheetLoaded = linkTag => {
    Object.defineProperty(linkTag, 'sheet', {
      value: {},
      configurable: true
    })
    linkTag.dispatchEvent(new Event('load'))
  }

  beforeEach(() => {
    document.body.innerHTML = '<main id="whatsapp-container"></main>'
    Configuration.whatsapp.container = '#whatsapp-container'
    jest.spyOn(API.whatsappWidgets, 'get')
  })

  afterEach(() => {
    jest.restoreAllMocks()
    document.body.innerHTML = ''
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      link.dispatchEvent(new Event('error'))
      link.remove()
    })
    Configuration.whatsapp.container = 'body'
  })

  it('waits for the stylesheet before appending the widget HTML', () => {
    const linkTag = createStylesheet({ loaded: false })
    const article = document.createElement('article')
    API.whatsappWidgets.get.mockResolvedValue(article)

    return WhatsAppWidget.load('widget-id').then(widget => {
      expect(document.querySelector('#whatsapp-container article')).toBeNull()

      markStylesheetLoaded(linkTag)

      return widget.rendered.then(() => {
        expect(document.querySelector('#whatsapp-container article')).toBe(article)
        expect(widget.mounted).toBe(true)
      })
    })
  })

  it('marks itself when webchat is already mounted', () => {
    createStylesheet()
    document.body.insertAdjacentHTML('beforeend', '<article class="hellotext--webchat"></article>')
    const article = document.createElement('article')
    article.className = 'hellotext--webchat hellotext--whatsapp-widget'
    API.whatsappWidgets.get.mockResolvedValue(article)

    return WhatsAppWidget.load('widget-id').then(widget => {
      return widget.rendered.then(() => {
        expect(widget.mounted).toBe(true)
        expect(article.classList.contains('hellotext--with-webchat')).toBe(true)
        expect(document.querySelector('.hellotext--webchat:not(.hellotext--whatsapp-widget)').classList.contains('hellotext--with-whatsapp-widget')).toBe(true)
      })
    })
  })

  it('does not mount when the API returns no widget HTML', () => {
    createStylesheet()
    API.whatsappWidgets.get.mockResolvedValue(null)

    return WhatsAppWidget.load('widget-id').then(widget => {
      return widget.rendered.then(() => {
        expect(document.querySelector('#whatsapp-container').children.length).toBe(0)
        expect(widget.mounted).toBe(false)
      })
    })
  })

  it('does not mount when the configured container is missing', () => {
    createStylesheet()
    Configuration.whatsapp.container = '#missing-container'
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    API.whatsappWidgets.get.mockResolvedValue(document.createElement('article'))

    return WhatsAppWidget.load('widget-id').then(widget => {
      return widget.rendered.then(() => {
        expect(widget.mounted).toBe(false)
        expect(console.warn).toHaveBeenCalledWith('Hellotext WhatsApp widget was not mounted because the container #missing-container was not found.')
      })
    })
  })

  it('does not mount when the configured container selector is invalid', () => {
    createStylesheet()
    Configuration.whatsapp.container = '['
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    API.whatsappWidgets.get.mockResolvedValue(document.createElement('article'))

    return WhatsAppWidget.load('widget-id').then(widget => {
      return widget.rendered.then(() => {
        expect(widget.mounted).toBe(false)
        expect(console.warn).toHaveBeenCalledWith('Hellotext WhatsApp widget was not mounted because the container [ was not found.')
      })
    })
  })
})
