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

  describe('.browser', () => {
    it.each([
      ['android', 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36'],
      ['edge', 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130.0 Safari/537.36 Edg/130.0'],
      ['firefox', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:131.0) Gecko/20100101 Firefox/131.0'],
      ['chrome', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130.0 Safari/537.36'],
      ['safari', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15'],
      ['other', 'SomeBot/1.0'],
    ])('names %s', (browser, userAgent) => {
      expect(Popup.browser(userAgent)).toBe(browser)
    })
  })

  describe('remembering a sent popup', () => {
    const key = 'hello_popup_submitted_popup-id'
    const clearCookie = () => {
      document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }

    afterEach(() => {
      localStorage.clear()
      clearCookie()
    })

    it('is not remembered until the popup is sent', () => {
      expect(Popup.submitted('popup-id')).toBe(false)
    })

    it('keeps the mark in a cookie and in localStorage', () => {
      Popup.markSubmitted('popup-id')

      expect(document.cookie).toContain(`${key}=1`)
      expect(localStorage.getItem(key)).toBe('1')
      expect(Popup.submitted('popup-id')).toBe(true)
      expect(Popup.submitted('other-popup')).toBe(false)
    })

    it('restores the cookie from localStorage when the cookies were cleared', () => {
      Popup.markSubmitted('popup-id')
      clearCookie()

      expect(Popup.submitted('popup-id')).toBe(true)
      expect(document.cookie).toContain(`${key}=1`)
    })

    it('restores localStorage from the cookie when site storage was cleared', () => {
      Popup.markSubmitted('popup-id')
      localStorage.clear()

      expect(Popup.submitted('popup-id')).toBe(true)
      expect(localStorage.getItem(key)).toBe('1')
    })

    it('still uses the cookie when localStorage is unavailable', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError')
      })
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('SecurityError')
      })

      Popup.markSubmitted('popup-id')

      expect(Popup.submitted('popup-id')).toBe(true)
    })

    it('forgets a cancelled submission even when another host kept a copy in its localStorage', () => {
      Popup.markSubmitted('popup-id')
      Popup.forgetSubmitted('popup-id')
      // The bare domain copied the shared cookie into its own localStorage before the cancel.
      localStorage.setItem(key, '1')

      expect(Popup.submitted('popup-id')).toBe(false)
      expect(localStorage.getItem(key)).toBeNull()
    })

    it('remembers the popup again once the corrected submission is sent', () => {
      Popup.markSubmitted('popup-id')
      Popup.forgetSubmitted('popup-id')

      Popup.markSubmitted('popup-id')

      expect(Popup.submitted('popup-id')).toBe(true)
    })

    it('stores nothing for an id that is not a public popup id', () => {
      Popup.markSubmitted('bad id;')

      expect(Popup.submitted('bad id;')).toBe(false)
      expect(document.cookie).not.toContain('hello_popup_submitted_')
      expect(localStorage.length).toBe(0)
    })
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

  it('does not mount after a newer initialization supersedes the request', async () => {
    const article = document.createElement('article')
    API.popups.get.mockResolvedValue(article)

    const popup = await Popup.load('popup-id', { shouldMount: () => false })

    expect(document.querySelector('#popup-container article')).toBeNull()
    expect(popup.mounted).toBe(false)
  })

  it('marks a popup opened from a short link before mounting it', async () => {
    const article = document.createElement('article')
    API.popups.get.mockResolvedValue(article)

    await Popup.load('popup-id', { linked: true })

    expect(article.getAttribute('data-hellotext--popup-linked-value')).toEqual('true')
  })

  it('leaves the server markup alone for a popup the page opened itself', async () => {
    const article = document.createElement('article')
    API.popups.get.mockResolvedValue(article)

    await Popup.load('popup-id')

    expect(article.hasAttribute('data-hellotext--popup-linked-value')).toBe(false)
  })

  it('unmounts its rendered surface', async () => {
    const article = document.createElement('article')
    API.popups.get.mockResolvedValue(article)

    const popup = await Popup.load('popup-id')
    popup.unmount()

    expect(document.querySelector('#popup-container article')).toBeNull()
    expect(popup.mounted).toBe(false)
  })
})
