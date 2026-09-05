/**
 * @jest-environment jsdom
 */

import API from '../../src/api'
import { Configuration } from '../../src/core'
import { Popup } from '../../src/models'

describe('Popup', () => {
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

  it.each(['missing', 'loading', 'failed'])('mounts immediately when the stylesheet is %s', async state => {
    if (state !== 'missing') {
      const linkTag = document.createElement('link')
      linkTag.rel = 'stylesheet'
      linkTag.href = 'https://example.com/hellotext.css'
      linkTag.setAttribute('data-hellotext-stylesheet', 'true')
      if (state === 'failed') linkTag.dataset.hellotextStylesheetLoaded = 'false'
      document.head.appendChild(linkTag)
    }

    const article = document.createElement('article')
    article.className = 'hellotext--popup'
    API.popups.get.mockResolvedValue(article)

    const popup = await Popup.load('popup-id')

    expect(document.querySelector('#popup-container article')).toBe(article)
    expect(popup.mounted).toBe(true)
    await expect(popup.rendered).resolves.toBe(true)
  })

  it('does not mount when the API returns no popup HTML', () => {
    API.popups.get.mockResolvedValue(null)

    return Popup.load('popup-id').then(popup => {
      return popup.rendered.then(() => {
        expect(document.querySelector('#popup-container').children.length).toBe(0)
        expect(popup.mounted).toBe(false)
      })
    })
  })

  it('does not mount when the configured container is missing', () => {
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
