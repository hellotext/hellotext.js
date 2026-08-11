/**
 * @jest-environment jsdom
 */

import API from '../../src/api'
import { Configuration } from '../../src/core'
import { Popup } from '../../src/models'

describe('Popup', () => {
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
      configurable: true,
    })
    linkTag.dispatchEvent(new Event('load'))
  }

  beforeEach(() => {
    document.body.innerHTML = '<main id="popup-container"></main>'
    Configuration.popup.container = '#popup-container'
    jest.spyOn(API.popups, 'get')
  })

  afterEach(() => {
    jest.restoreAllMocks()
    document.body.innerHTML = ''
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      link.dispatchEvent(new Event('error'))
      link.remove()
    })
    Configuration.popup.container = 'body'
  })

  it('waits for the stylesheet before appending the popup HTML', () => {
    const linkTag = createStylesheet({ loaded: false })
    const article = document.createElement('article')
    article.className = 'hellotext--popup'
    API.popups.get.mockResolvedValue(article)

    return Popup.load('popup-id').then(popup => {
      expect(document.querySelector('#popup-container article')).toBeNull()

      markStylesheetLoaded(linkTag)

      return popup.rendered.then(() => {
        expect(document.querySelector('#popup-container article')).toBe(article)
        expect(popup.mounted).toBe(true)
      })
    })
  })

  it('does not mount when the API returns no popup HTML', () => {
    createStylesheet()
    API.popups.get.mockResolvedValue(null)

    return Popup.load('popup-id').then(popup => {
      return popup.rendered.then(() => {
        expect(document.querySelector('#popup-container').children.length).toBe(0)
        expect(popup.mounted).toBe(false)
      })
    })
  })

  it('does not mount when the configured container is missing', () => {
    createStylesheet()
    Configuration.popup.container = '#missing-container'
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    API.popups.get.mockResolvedValue(document.createElement('article'))

    return Popup.load('popup-id').then(popup => {
      return popup.rendered.then(() => {
        expect(popup.mounted).toBe(false)
        expect(console.warn).toHaveBeenCalledWith('Hellotext popup was not mounted because the container #missing-container was not found.')
      })
    })
  })

  it('does not mount when the configured container selector is invalid', () => {
    createStylesheet()
    Configuration.popup.container = '['
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    API.popups.get.mockResolvedValue(document.createElement('article'))

    return Popup.load('popup-id').then(popup => {
      return popup.rendered.then(() => {
        expect(popup.mounted).toBe(false)
        expect(console.warn).toHaveBeenCalledWith('Hellotext popup was not mounted because the container [ was not found.')
      })
    })
  })
})
