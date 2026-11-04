/**
 * @jest-environment jsdom
 */

import API from '../../src/api'
import { Configuration } from '../../src/core'
import { Session, WhatsAppWidget } from '../../src/models'

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

  describe('links', () => {
    const clickUrl = 'https://api.hellotext.test/v1/public/widgets/whatsapp/widget-id/click'

    const widgetHtml = () => {
      const article = document.createElement('article')
      article.setAttribute('data-hellotext--whatsapp-widget-click-url-value', clickUrl)
      article.innerHTML = `
        <a class="hellotext--webchat-teaser-message" href="${clickUrl}?number=15551234567&text=Hola+desde+la+tienda">Hola</a>
        <a class="hellotext--webchat-trigger" href="${clickUrl}?number=15551234567&text=Hola+desde+la+tienda"></a>
        <a class="other" href="https://shop.example.test/help">Help</a>
      `

      return article
    }

    const query = href => Object.fromEntries(new URL(href).searchParams)

    it('leads every widget link through the click endpoint with the session', () => {
      createStylesheet()
      jest.spyOn(Session, 'session', 'get').mockReturnValue('session-id')
      const article = widgetHtml()
      API.whatsappWidgets.get.mockResolvedValue(article)

      return WhatsAppWidget.load('widget-id').then(widget => widget.rendered).then(() => {
        ;['.hellotext--webchat-trigger', '.hellotext--webchat-teaser-message'].forEach(selector => {
          const href = article.querySelector(selector).getAttribute('href')

          expect(href.startsWith(`${clickUrl}?`)).toBe(true)
          expect(query(href)).toEqual({ number: '15551234567', text: 'Hola desde la tienda', session: 'session-id' })
        })
      })
    })

    it('leaves links that do not lead to the click endpoint alone', () => {
      createStylesheet()
      jest.spyOn(Session, 'session', 'get').mockReturnValue('session-id')
      const article = widgetHtml()
      API.whatsappWidgets.get.mockResolvedValue(article)

      return WhatsAppWidget.load('widget-id').then(widget => widget.rendered).then(() => {
        expect(article.querySelector('.other').getAttribute('href')).toBe('https://shop.example.test/help')
      })
    })

    it('keeps the rendered links without a session', () => {
      createStylesheet()
      jest.spyOn(Session, 'session', 'get').mockReturnValue(undefined)
      const article = widgetHtml()
      API.whatsappWidgets.get.mockResolvedValue(article)

      return WhatsAppWidget.load('widget-id').then(widget => widget.rendered).then(() => {
        expect(article.querySelector('.hellotext--webchat-trigger').getAttribute('href'))
          .toBe(`${clickUrl}?number=15551234567&text=Hola+desde+la+tienda`)
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
