/**
 * @jest-environment jsdom
 */

import Hellotext from '../../src/hellotext'
import { Cookies } from '../../src/models'

beforeEach(() => {
  document.cookie = ''
  jest.clearAllMocks()
})

describe('set', () => {
  it('sets the value of a cookie', () => {
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
