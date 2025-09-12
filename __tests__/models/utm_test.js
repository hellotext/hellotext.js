/**
 * @jest-environment jsdom
 */

// Mock the Hellotext default export first
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

import { Cookies } from '../../src/models/cookies'
import { UTM } from '../../src/models/utm'

// Mock Cookies
jest.mock('../../src/models/cookies')

describe('UTM', () => {
  let mockCookiesSet
  let mockCookiesGet

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Mock Cookies methods
    mockCookiesSet = jest.fn()
    mockCookiesGet = jest.fn()
    Cookies.set = mockCookiesSet
    Cookies.get = mockCookiesGet

    // Mock window.location.search
    delete window.location
    window.location = { search: '' }
  })

  describe('constructor', () => {
    it('stores UTM parameters in cookies when utm_source and utm_medium are present', () => {
      window.location.search = '?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale&utm_term=shoes&utm_content=ad1'

      new UTM()

      expect(mockCookiesSet).toHaveBeenCalledWith(
        'hello_utm',
        JSON.stringify({
          source: 'google',
          medium: 'cpc',
          campaign: 'summer_sale',
          term: 'shoes',
          content: 'ad1'
        })
      )
    })

    it('stores UTM parameters in cookies with only source and medium', () => {
      window.location.search = '?utm_source=facebook&utm_medium=social'

      new UTM()

      expect(mockCookiesSet).toHaveBeenCalledWith(
        'hello_utm',
        JSON.stringify({
          source: 'facebook',
          medium: 'social'
        })
      )
    })

    it('filters out null UTM parameters but keeps non-null ones', () => {
      window.location.search = '?utm_source=twitter&utm_medium=social&utm_campaign=&utm_term=hashtag'

      new UTM()

      expect(mockCookiesSet).toHaveBeenCalledWith(
        'hello_utm',
        JSON.stringify({
          source: 'twitter',
          medium: 'social',
          term: 'hashtag'
        })
      )
    })

    it('does not store anything when utm_source is missing', () => {
      window.location.search = '?utm_medium=email&utm_campaign=newsletter'

      new UTM()

      expect(mockCookiesSet).not.toHaveBeenCalled()
    })

    it('does not store anything when utm_medium is missing', () => {
      window.location.search = '?utm_source=google&utm_campaign=summer_sale'

      new UTM()

      expect(mockCookiesSet).not.toHaveBeenCalled()
    })

    it('does not store anything when both utm_source and utm_medium are missing', () => {
      window.location.search = '?utm_campaign=summer_sale&utm_term=shoes'

      new UTM()

      expect(mockCookiesSet).not.toHaveBeenCalled()
    })

    it('does not store anything when utm_source is null/empty', () => {
      window.location.search = '?utm_source=&utm_medium=email'

      new UTM()

      expect(mockCookiesSet).not.toHaveBeenCalled()
    })

    it('does not store anything when utm_medium is null/empty', () => {
      window.location.search = '?utm_source=google&utm_medium='

      new UTM()

      expect(mockCookiesSet).not.toHaveBeenCalled()
    })

    it('handles URL without any search parameters', () => {
      window.location.search = ''

      new UTM()

      expect(mockCookiesSet).not.toHaveBeenCalled()
    })

    it('handles URL with unrelated search parameters', () => {
      window.location.search = '?page=1&sort=name&filter=active'

      new UTM()

      expect(mockCookiesSet).not.toHaveBeenCalled()
    })
  })

  describe('current getter', () => {
    it('returns parsed UTM data from cookies', () => {
      const utmData = {
        source: 'google',
        medium: 'cpc',
        campaign: 'summer_sale'
      }
      mockCookiesGet.mockReturnValue(JSON.stringify(utmData))

      const utm = new UTM()
      const result = utm.current

      expect(mockCookiesGet).toHaveBeenCalledWith('hello_utm')
      expect(result).toEqual(utmData)
    })

    it('returns empty object when cookie does not exist', () => {
      mockCookiesGet.mockReturnValue(undefined)

      const utm = new UTM()
      const result = utm.current

      expect(result).toEqual({})
    })

    it('returns empty object when cookie value is null', () => {
      mockCookiesGet.mockReturnValue(null)

      const utm = new UTM()
      const result = utm.current

      expect(result).toEqual({})
    })

    it('returns empty object when cookie value is empty string', () => {
      mockCookiesGet.mockReturnValue('')

      const utm = new UTM()
      const result = utm.current

      expect(result).toEqual({})
    })

    it('returns empty object when JSON parsing fails', () => {
      mockCookiesGet.mockReturnValue('invalid-json-string')

      const utm = new UTM()
      const result = utm.current

      expect(result).toEqual({})
    })

    it('returns empty object when cookie contains malformed JSON', () => {
      mockCookiesGet.mockReturnValue('{invalid json}')

      const utm = new UTM()
      const result = utm.current

      expect(result).toEqual({})
    })

    it('handles JSON.parse returning null', () => {
      mockCookiesGet.mockReturnValue('null')

      const utm = new UTM()
      const result = utm.current

      expect(result).toEqual({})
    })

    it('multiple calls to current should return consistent results', () => {
      const utmData = { source: 'facebook', medium: 'social' }
      mockCookiesGet.mockReturnValue(JSON.stringify(utmData))

      const utm = new UTM()
      const result1 = utm.current
      const result2 = utm.current

      expect(result1).toEqual(utmData)
      expect(result2).toEqual(utmData)
      expect(mockCookiesGet).toHaveBeenCalledTimes(2)
    })
  })

  describe('initialize static method', () => {
    it('creates UTM instance and processes URL parameters', () => {
      window.location.search = '?utm_source=instagram&utm_medium=social&utm_campaign=influencer'

      new UTM()

      expect(mockCookiesSet).toHaveBeenCalledWith(
        'hello_utm',
        JSON.stringify({
          source: 'instagram',
          medium: 'social',
          campaign: 'influencer'
        })
      )
    })

    it('does not set cookies when required UTM parameters are missing', () => {
      window.location.search = '?utm_campaign=test&utm_term=keyword'

      new UTM()

      expect(mockCookiesSet).not.toHaveBeenCalled()
    })
  })

  describe('integration scenarios', () => {
    it('should work end-to-end: set UTMs from URL then retrieve them', () => {
      // First, set up URL with UTM parameters
      window.location.search = '?utm_source=newsletter&utm_medium=email&utm_campaign=monthly'

      // Create UTM instance (this should store the UTMs)
      new UTM()

      // Verify the cookie was set
      expect(mockCookiesSet).toHaveBeenCalledWith(
        'hello_utm',
        JSON.stringify({
          source: 'newsletter',
          medium: 'email',
          campaign: 'monthly'
        })
      )

      // Now simulate getting the data back
      const expectedData = {
        source: 'newsletter',
        medium: 'email',
        campaign: 'monthly'
      }
      mockCookiesGet.mockReturnValue(JSON.stringify(expectedData))

      const utm = new UTM()
      expect(utm.current).toEqual(expectedData)
    })
  })
})
