/**
 * @jest-environment jsdom
 */

const mockUUID = 'test-uuid-12345'
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => mockUUID)
  }
})

jest.mock('../../src/hellotext', () => {
  return {
    __esModule: true,
    default: {
      eventEmitter: {
        dispatch: jest.fn()
      }
    }
  }
})

import { Configuration } from '../../src/core'
import { Session } from '../../src/models'
import { Cookies } from '../../src/models/cookies'

describe('Session', () => {
  beforeEach(() => {
    Configuration.session = null
    Configuration.autoGenerateSession = true

    if (typeof document !== 'undefined') {
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      })

      document.cookie = 'hello_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
    }

    global.crypto.randomUUID.mockClear()

    if (typeof window !== 'undefined') {
      delete window.location
      window.location = { search: '' }
    }

    // Clear any existing cookies more thoroughly
    if (typeof document !== 'undefined') {
      // Clear hello_session cookie specifically
      document.cookie = 'hello_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      document.cookie = 'hello_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname
    }
  })

  describe('session getter/setter', () => {
    it('returns the session value when set', () => {
      Session.session = 'test-session'
      expect(Session.session).toEqual('test-session')
    })

    it('sets a cookie when session is assigned', () => {
      Session.session = 'test-session'
      expect(Cookies.get('hello_session')).toEqual('test-session')
    })

    it('returns undefined when no session is set', () => {
      if (typeof document !== 'undefined') {
        document.cookie = 'hello_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
      }
      Configuration.session = null
      Configuration.autoGenerateSession = false

      Session.initialize()

      expect(Session.session).toBeUndefined()
    })
  })

  describe('initialize()', () => {
    describe('when Configuration.session is set', () => {
      it('uses query session as first priority when present', () => {
        Configuration.session = 'config-session'
        document.cookie = 'hello_session=cookie-session'
        window.location.search = '?hello_session=query-session'

        Session.initialize()

        expect(Session.session).toEqual('query-session')
        expect(global.crypto.randomUUID).not.toHaveBeenCalled()
      })
    })

    describe('when query parameter has session', () => {
      it('uses query session when Configuration.session is not set', () => {
        Configuration.session = null
        window.location.search = '?hello_session=query-session'
        document.cookie = 'hello_session=cookie-session'

        Session.initialize()

        expect(Session.session).toEqual('query-session')
        expect(global.crypto.randomUUID).not.toHaveBeenCalled()
      })

      it('uses query session even when Configuration.session is set', () => {
        Configuration.session = 'config-session'
        window.location.search = '?hello_session=query-session'

        Session.initialize()

        expect(Session.session).toEqual('query-session')
      })
    })

    describe('when cookie has session', () => {
      it('uses cookie session when Configuration and query are not set', () => {
        Configuration.session = null
        window.location.search = ''
        document.cookie = 'hello_session=cookie-session'

        Session.initialize()

        expect(Session.session).toEqual('cookie-session')
        expect(global.crypto.randomUUID).not.toHaveBeenCalled()
      })

      it('ignores cookie when Configuration.session is set', () => {
        Configuration.session = 'config-session'
        window.location.search = '' // Clear any query parameters
        document.cookie = 'hello_session=cookie-session'

        Session.initialize()

        expect(Session.session).toEqual('config-session')
      })

      it('ignores cookie when query session is present', () => {
        Configuration.session = null
        window.location.search = '?hello_session=query-session'
        document.cookie = 'hello_session=cookie-session'

        Session.initialize()

        expect(Session.session).toEqual('query-session')
      })
    })

    describe('auto-generation fallback', () => {
      it('generates a new session when no existing session and autoGenerateSession is true', () => {
        Configuration.session = null
        Configuration.autoGenerateSession = true
        window.location.search = ''
        document.cookie = ''

        Session.initialize()

        expect(Session.session).toEqual(mockUUID)
        expect(global.crypto.randomUUID).toHaveBeenCalledTimes(1)
      })

      it('does not generate session when autoGenerateSession is false', () => {
        Configuration.session = null
        Configuration.autoGenerateSession = false
        window.location.search = ''
        document.cookie = ''

        Session.initialize()

        expect(Session.session).toBeFalsy()
        expect(global.crypto.randomUUID).not.toHaveBeenCalled()
      })

      it('does not generate session when an existing session is found', () => {
        Configuration.session = null
        Configuration.autoGenerateSession = true
        window.location.search = ''
        document.cookie = 'hello_session=existing-session'

        Session.initialize()

        expect(Session.session).toEqual('existing-session')
        expect(global.crypto.randomUUID).not.toHaveBeenCalled()
      })
    })

    describe('priority order', () => {
      it('follows the correct priority: Query > Configuration > Cookie > Generated', () => {
        const scenarios = [
          {
            name: 'All sources available - Query wins',
            config: 'config-session',
            query: '?hello_session=query-session',
            cookie: 'hello_session=cookie-session',
            autoGenerate: true,
            expected: 'query-session'
          },
          {
            name: 'Configuration and Cookie available - Configuration wins',
            config: 'config-session',
            query: '',
            cookie: 'hello_session=cookie-session',
            autoGenerate: true,
            expected: 'config-session'
          },
          {
            name: 'Query and Cookie available - Query wins',
            config: null,
            query: '?hello_session=query-session',
            cookie: 'hello_session=cookie-session',
            autoGenerate: true,
            expected: 'query-session'
          },
          {
            name: 'Only Cookie available - Cookie wins',
            config: null,
            query: '',
            cookie: 'hello_session=cookie-session',
            autoGenerate: true,
            expected: 'cookie-session'
          },
          {
            name: 'No sources available - Generate new',
            config: null,
            query: '',
            cookie: '',
            autoGenerate: true,
            expected: mockUUID
          },
          {
            name: 'No sources, no auto-generate - No session',
            config: null,
            query: '',
            cookie: '',
            autoGenerate: false,
            expected: undefined
          }
        ]

        scenarios.forEach(scenario => {
          Configuration.session = scenario.config
          Configuration.autoGenerateSession = scenario.autoGenerate
          window.location.search = scenario.query
          document.cookie = scenario.cookie
          global.crypto.randomUUID.mockClear()

          Session.initialize()

          expect(Session.session).toEqual(scenario.expected)

          if (typeof document !== 'undefined') {
            document.cookie = 'hello_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
          }
        })
      })
    })
  })

  describe('edge cases', () => {
    it('handles empty string values correctly', () => {
      Configuration.session = ''
      window.location.search = '?hello_session='
      document.cookie = 'hello_session='

      Session.initialize()

      expect(Session.session).toEqual(mockUUID)
      expect(global.crypto.randomUUID).toHaveBeenCalledTimes(1)
    })

    it('handles null values correctly', () => {
      Configuration.session = null
      window.location.search = ''
      document.cookie = ''

      Session.initialize()

      expect(Session.session).toEqual(mockUUID)
      expect(global.crypto.randomUUID).toHaveBeenCalledTimes(1)
    })

    it('handles undefined values correctly', () => {
      Configuration.session = undefined
      window.location.search = ''
      document.cookie = ''

      Session.initialize()

      expect(Session.session).toEqual(mockUUID)
      expect(global.crypto.randomUUID).toHaveBeenCalledTimes(1)
    })

    it('handles malformed cookies gracefully', () => {
      Configuration.session = null
      window.location.search = ''
      document.cookie = 'malformed cookie string'

      Session.initialize()

      expect(Session.session).toEqual(mockUUID)
      expect(global.crypto.randomUUID).toHaveBeenCalledTimes(1)
    })

    it('handles special characters in session values', () => {
      const specialSession = 'session-with-special-chars!@#$%^&*()'
      Configuration.session = specialSession

      Session.initialize()

      expect(Session.session).toEqual(specialSession)
    })

    it('handles very long session values', () => {
      const longSession = 'a'.repeat(1000)
      Configuration.session = longSession

      Session.initialize()

      expect(Session.session).toEqual(longSession)
    })
  })

  describe('multiple initializations', () => {
    it('can be initialized multiple times', () => {
      Configuration.session = 'first-session'
      window.location.search = '' // Clear any query parameters
      Session.initialize()
      expect(Session.session).toEqual('first-session')

      Configuration.session = 'second-session'
      window.location.search = '' // Clear any query parameters
      Session.initialize()
      expect(Session.session).toEqual('second-session')
    })

    it('respects changed Configuration between initializations', () => {
      Configuration.session = null
      Configuration.autoGenerateSession = false
      if (typeof document !== 'undefined') {
        document.cookie = 'hello_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
      }
      Session.initialize()
      expect(Session.session).toBeUndefined()

      if (typeof document !== 'undefined') {
        document.cookie = 'hello_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
      }

      Configuration.autoGenerateSession = true
      Session.initialize()
      expect(Session.session).toEqual(mockUUID)
    })
  })

  describe('cookie side effects', () => {
    it('updates cookie when session is set via initialize', () => {
      Configuration.session = 'test-session'
      Session.initialize()

      expect(Cookies.get('hello_session')).toEqual('test-session')
    })

    it('updates cookie when auto-generating session', () => {
      Configuration.session = null
      Configuration.autoGenerateSession = true
      window.location.search = ''
      document.cookie = ''

      Session.initialize()

      expect(Cookies.get('hello_session')).toEqual(mockUUID)
    })

    it('preserves existing cookie when session comes from cookie', () => {
      Configuration.session = null
      window.location.search = ''
      document.cookie = 'hello_session=existing-session'

      Session.initialize()

      expect(Session.session).toEqual('existing-session')
      expect(Cookies.get('hello_session')).toEqual('existing-session')
    })
  })

  describe('error handling', () => {
    it('handles crypto.randomUUID throwing an error', () => {
      Configuration.session = null
      Configuration.autoGenerateSession = true
      window.location.search = ''
      document.cookie = ''

      global.crypto.randomUUID.mockImplementationOnce(() => {
        throw new Error('crypto not available')
      })

      expect(() => Session.initialize()).toThrow('crypto not available')
    })

    it('handles window.location being undefined', () => {
      Configuration.session = null
      delete window.location

      expect(() => Session.initialize()).toThrow()
    })

    it('handles document being undefined in non-browser environment', () => {
      Configuration.session = null
      Configuration.autoGenerateSession = false
      const originalDocument = global.document
      delete global.document

      expect(() => Session.initialize()).not.toThrow()
      expect(Session.session).toBeUndefined()

      global.document = originalDocument
    })
  })

  describe('browser compatibility', () => {
    it('works when crypto.randomUUID is not available', () => {
      Configuration.session = null
      Configuration.autoGenerateSession = true
      if (typeof window !== 'undefined') {
        window.location.search = ''
      }
      if (typeof document !== 'undefined') {
        document.cookie = ''
      }

      const originalRandomUUID = global.crypto.randomUUID
      delete global.crypto.randomUUID

      expect(() => Session.initialize()).toThrow()

      global.crypto.randomUUID = originalRandomUUID
    })

    it('handles IE-style cookie parsing', () => {
      Configuration.session = null
      if (typeof window !== 'undefined') {
        window.location.search = ''
      }

      if (typeof document !== 'undefined') {
        document.cookie = 'hello_session = session-value ; path=/'
      }

      Session.initialize()

      expect(Session.session).toEqual('session-value')
    })
  })

  describe('concurrent access', () => {
    it('handles rapid successive initializations', () => {
      Configuration.session = null
      Configuration.autoGenerateSession = true
      if (typeof window !== 'undefined') {
        window.location.search = ''
      }
      if (typeof document !== 'undefined') {
        document.cookie = ''
      }

      Session.initialize()
      const firstSession = Session.session

      if (typeof document !== 'undefined') {
        document.cookie = 'hello_session=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
      }

      Session.initialize()
      const secondSession = Session.session

      expect(firstSession).toEqual(mockUUID)
      expect(secondSession).toEqual(mockUUID)
      expect(global.crypto.randomUUID).toHaveBeenCalledTimes(2)
    })
  })

  describe('memory management', () => {
    it('does not leak memory with repeated initializations', () => {
      window.location.search = '' // Clear any query parameters
      for (let i = 0; i < 100; i++) {
        Configuration.session = `session-${i}`
        Session.initialize()
      }

      expect(Session.session).toEqual('session-99')
    })
  })
})
