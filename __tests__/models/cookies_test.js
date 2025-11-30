/**
 * @jest-environment jsdom
 */

import Hellotext from '../../src/hellotext'
import { Cookies } from '../../src/models'
import { Page } from '../../src/models/page'

beforeEach(() => {
  document.cookie = ''
  jest.clearAllMocks()

  // Mock window.location
  delete window.location
  window.location = {
    protocol: 'https:',
    hostname: 'www.example.com',
    href: 'https://www.example.com/page'
  }
})

describe('set', () => {
  it('sets the value of a cookie', () => {
    // Mock document.cookie to simulate actual browser behavior
    let cookieStore = {}

    Object.defineProperty(document, 'cookie', {
      get: function() {
        return Object.entries(cookieStore)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ')
      },
      set: function(cookieString) {
        const match = cookieString.match(/^([^=]+)=([^;]+)/)
        if (match) {
          cookieStore[match[1]] = match[2]
        }
      },
      configurable: true
    })

    expect(Cookies.get('hello_session')).toEqual(undefined)

    Cookies.set('hello_session', 'session')
    expect(Cookies.get('hello_session')).toEqual('session')
  })

  describe('event dispatching', () => {
    beforeEach(() => {
      // Mock the dispatch method
      jest.spyOn(Hellotext.eventEmitter, 'dispatch').mockImplementation(() => {})
    })

    afterEach(() => {
      // Restore the original implementation
      Hellotext.eventEmitter.dispatch.mockRestore()
    })

    it('dispatches session-set event when hello_session cookie is set', () => {
      const sessionValue = 'test-session-123'

      Cookies.set('hello_session', sessionValue)

      expect(Hellotext.eventEmitter.dispatch).toHaveBeenCalledTimes(1)
      expect(Hellotext.eventEmitter.dispatch).toHaveBeenCalledWith('session-set', sessionValue)
    })

    it('dispatches utm-set event when hello_utm cookie is set', () => {
      const utmValue = 'utm_source=google&utm_medium=cpc'

      Cookies.set('hello_utm', utmValue)

      expect(Hellotext.eventEmitter.dispatch).toHaveBeenCalledTimes(1)
      expect(Hellotext.eventEmitter.dispatch).toHaveBeenCalledWith('utm-set', utmValue)
    })

    it('does not dispatch events for other cookies', () => {
      Cookies.set('regular_cookie', 'some_value')
      Cookies.set('another_cookie', 'another_value')

      expect(Hellotext.eventEmitter.dispatch).not.toHaveBeenCalled()
    })

    it('dispatches correct event for each specific cookie type', () => {
      // Set multiple cookies in sequence
      Cookies.set('hello_session', 'session-value')
      Cookies.set('hello_utm', 'utm-value')
      Cookies.set('other_cookie', 'other-value')

      expect(Hellotext.eventEmitter.dispatch).toHaveBeenCalledTimes(2)
      expect(Hellotext.eventEmitter.dispatch).toHaveBeenNthCalledWith(1, 'session-set', 'session-value')
      expect(Hellotext.eventEmitter.dispatch).toHaveBeenNthCalledWith(2, 'utm-set', 'utm-value')
    })

    it('returns the value after setting the cookie', () => {
      const value = 'test-value'
      const result = Cookies.set('hello_session', value)

      expect(result).toEqual(value)
    })

    it('dispatches event with empty string value', () => {
      Cookies.set('hello_session', '')

      expect(Hellotext.eventEmitter.dispatch).toHaveBeenCalledWith('session-set', '')
    })

    it('dispatches event with special characters in value', () => {
      const specialValue = 'test@#$%^&*()_+={}[]|\\:";\'<>?,./~`'

      Cookies.set('hello_utm', specialValue)

      expect(Hellotext.eventEmitter.dispatch).toHaveBeenCalledWith('utm-set', specialValue)
    })

    it('dispatches events for multiple session sets', () => {
      Cookies.set('hello_session', 'first-session')
      Cookies.set('hello_session', 'second-session')
      Cookies.set('hello_session', 'third-session')

      expect(Hellotext.eventEmitter.dispatch).toHaveBeenCalledTimes(3)
      expect(Hellotext.eventEmitter.dispatch).toHaveBeenNthCalledWith(1, 'session-set', 'first-session')
      expect(Hellotext.eventEmitter.dispatch).toHaveBeenNthCalledWith(2, 'session-set', 'second-session')
      expect(Hellotext.eventEmitter.dispatch).toHaveBeenNthCalledWith(3, 'session-set', 'third-session')
    })

    it('sets cookie before dispatching event (even if dispatch fails)', () => {
      // Mock document.cookie to simulate actual browser behavior
      let cookieStore = {}

      Object.defineProperty(document, 'cookie', {
        get: function() {
          return Object.entries(cookieStore)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ')
        },
        set: function(cookieString) {
          const match = cookieString.match(/^([^=]+)=([^;]+)/)
          if (match) {
            cookieStore[match[1]] = match[2]
          }
        },
        configurable: true
      })

      Hellotext.eventEmitter.dispatch.mockImplementation(() => {
        throw new Error('Dispatch failed')
      })

      expect(() => Cookies.set('hello_session', 'value')).toThrow('Dispatch failed')
      expect(Cookies.get('hello_session')).toEqual('value')
    })
  })

  describe('when document is undefined', () => {
    let originalDocument

    beforeEach(() => {
      originalDocument = global.document
      delete global.document
    })

    afterEach(() => {
      global.document = originalDocument
    })

    it('still dispatches events even without document', () => {
      jest.spyOn(Hellotext.eventEmitter, 'dispatch').mockImplementation(() => {})

      const result = Cookies.set('hello_session', 'session-value')

      expect(result).toEqual('session-value')
      expect(Hellotext.eventEmitter.dispatch).toHaveBeenCalledWith('session-set', 'session-value')

      Hellotext.eventEmitter.dispatch.mockRestore()
    })
  })
})

describe('get', () => {
  it('gets the value of a cookie', () => {
    document.cookie = 'hello_session=session'
    expect(Cookies.get('hello_session')).toEqual('session')
  })
})

describe('cookie attributes', () => {
  let setCookieSpy

  beforeEach(() => {
    // Spy on document.cookie setter
    setCookieSpy = jest.spyOn(document, 'cookie', 'set')
  })

  afterEach(() => {
    setCookieSpy.mockRestore()
  })

  describe('Secure flag', () => {
    it('sets Secure flag when protocol is https', () => {
      window.location.protocol = 'https:'

      Cookies.set('test_cookie', 'value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).toContain('Secure')
    })

    it('does not set Secure flag when protocol is http', () => {
      window.location.protocol = 'http:'

      Cookies.set('test_cookie', 'value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).not.toContain('Secure')
    })
  })

  describe('domain attribute', () => {
    it('sets domain attribute for regular TLD', () => {
      window.location.hostname = 'www.example.com'

      Cookies.set('test_cookie', 'value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).toContain('domain=.example.com')
    })

    it('sets domain attribute for multi-part TLD', () => {
      window.location.hostname = 'secure.storename.com.br'

      Cookies.set('test_cookie', 'value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).toContain('domain=.storename.com.br')
    })

    it('sets domain attribute for VTEX domains', () => {
      window.location.hostname = 'storename.vtexcommercestable.com.br'

      Cookies.set('test_cookie', 'value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).toContain('domain=.vtexcommercestable.com.br')
    })

    it('does not set domain attribute when getRootDomain returns null', () => {
      jest.spyOn(Page, 'getRootDomain').mockReturnValue(null)

      Cookies.set('test_cookie', 'value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).not.toMatch(/domain=/)

      Page.getRootDomain.mockRestore()
    })

    it('handles localhost without subdomain prefix', () => {
      window.location.hostname = 'localhost'

      Cookies.set('test_cookie', 'value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).toContain('domain=localhost')
    })
  })

  describe('SameSite attribute', () => {
    it('sets SameSite=Lax attribute', () => {
      Cookies.set('test_cookie', 'value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).toContain('SameSite=Lax')
    })
  })

  describe('max-age attribute', () => {
    it('sets max-age to 10 years', () => {
      Cookies.set('test_cookie', 'value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      const tenYearsInSeconds = 10 * 365 * 24 * 60 * 60
      expect(cookieString).toContain(`max-age=${tenYearsInSeconds}`)
    })
  })

  describe('path attribute', () => {
    it('sets path to /', () => {
      Cookies.set('test_cookie', 'value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).toContain('path=/')
    })
  })

  describe('complete cookie string format', () => {
    it('formats cookie with all attributes when domain is available (https)', () => {
      window.location.protocol = 'https:'
      window.location.hostname = 'www.example.com'

      Cookies.set('hello_session', 'test-value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).toBe('hello_session=test-value; path=/; Secure; domain=.example.com; max-age=315360000; SameSite=Lax')
    })

    it('formats cookie without domain attribute when domain is null (https)', () => {
      window.location.protocol = 'https:'
      jest.spyOn(Page, 'getRootDomain').mockReturnValue(null)

      Cookies.set('hello_session', 'test-value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).toBe('hello_session=test-value; path=/; Secure; max-age=315360000; SameSite=Lax')

      Page.getRootDomain.mockRestore()
    })

    it('formats cookie without Secure flag on http', () => {
      window.location.protocol = 'http:'
      window.location.hostname = 'localhost'

      Cookies.set('hello_session', 'test-value')

      const cookieString = setCookieSpy.mock.calls[0][0]
      expect(cookieString).toBe('hello_session=test-value; path=/; domain=localhost; max-age=315360000; SameSite=Lax')
    })
  })
})
