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

import { Page } from '../../src/models/page'
import { UTM } from '../../src/models/utm'

// Mock UTM
jest.mock('../../src/models/utm')

describe('Page', () => {
  let mockUtm

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock UTM instance
    mockUtm = {
      current: { source: 'test', medium: 'test' }
    }
    UTM.mockImplementation(() => mockUtm)

    // Mock window.location
    delete window.location
    window.location = {
      href: 'https://example.com/current-page?param=value',
      pathname: '/current-page'
    }

    // Mock document.title
    Object.defineProperty(document, 'title', {
      value: 'Current Page Title',
      writable: true
    })
  })

  describe('constructor', () => {
    it('creates UTM instance', () => {
      new Page()
      expect(UTM).toHaveBeenCalledTimes(1)
    })

    it('stores custom URL when provided', () => {
      const customUrl = 'https://custom.com/path'
      const page = new Page(customUrl)
      expect(page._url).toBe(customUrl)
    })

    it('stores null when no URL provided', () => {
      const page = new Page()
      expect(page._url).toBe(null)
    })
  })

  describe('url getter', () => {
    it('returns window.location.href when no custom URL provided', () => {
      const page = new Page()
      expect(page.url).toBe('https://example.com/current-page?param=value')
    })

    it('returns custom URL when provided', () => {
      const customUrl = 'https://custom.com/custom-path?test=123'
      const page = new Page(customUrl)
      expect(page.url).toBe(customUrl)
    })

    it('prefers custom URL over window.location', () => {
      const customUrl = 'https://different.com/path'
      const page = new Page(customUrl)
      expect(page.url).toBe(customUrl)
      expect(page.url).not.toBe(window.location.href)
    })
  })

  describe('title getter', () => {
    it('returns document.title', () => {
      const page = new Page()
      expect(page.title).toBe('Current Page Title')
    })

    it('returns updated document.title', () => {
      const page = new Page()
      document.title = 'Updated Title'
      expect(page.title).toBe('Updated Title')
    })

    it('returns document.title even with custom URL', () => {
      const page = new Page('https://custom.com/path')
      expect(page.title).toBe('Current Page Title')
    })
  })

  describe('path getter', () => {
    it('returns window.location.pathname when no custom URL', () => {
      const page = new Page()
      expect(page.path).toBe('/current-page')
    })

    it('extracts pathname from custom URL', () => {
      const page = new Page('https://custom.com/custom-path/sub?param=value')
      expect(page.path).toBe('/custom-path/sub')
    })

    it('handles root path from custom URL', () => {
      const page = new Page('https://custom.com/')
      expect(page.path).toBe('/')
    })

    it('returns "/" for invalid custom URL', () => {
      const page = new Page('invalid-url')
      expect(page.path).toBe('/')
    })

    it('handles URL without protocol', () => {
      const page = new Page('//example.com/path')
      expect(page.path).toBe('/')
    })
  })

  describe('utmParams getter', () => {
    it('returns UTM current data', () => {
      const utmData = { source: 'google', medium: 'cpc', campaign: 'test' }
      mockUtm.current = utmData

      const page = new Page()
      expect(page.utmParams).toBe(utmData)
    })

    it('returns empty object when UTM has no data', () => {
      mockUtm.current = {}

      const page = new Page()
      expect(page.utmParams).toEqual({})
    })
  })

  describe('trackingData getter', () => {
    it('returns complete tracking data with default values', () => {
      mockUtm.current = { source: 'facebook', medium: 'social' }

      const page = new Page()
      const trackingData = page.trackingData

      expect(trackingData).toEqual({
        page: {
          url: 'https://example.com/current-page?param=value',
          title: 'Current Page Title',
          path: '/current-page'
        },
        utm_params: { source: 'facebook', medium: 'social' }
      })
    })

    it('returns complete tracking data with custom URL', () => {
      mockUtm.current = { source: 'twitter', medium: 'social' }

      const page = new Page('https://custom.com/test-path?utm_source=twitter')
      const trackingData = page.trackingData

      expect(trackingData).toEqual({
        page: {
          url: 'https://custom.com/test-path?utm_source=twitter',
          title: 'Current Page Title',
          path: '/test-path'
        },
        utm_params: { source: 'twitter', medium: 'social' }
      })
    })

    it('handles empty UTM parameters', () => {
      mockUtm.current = {}

      const page = new Page()
      const trackingData = page.trackingData

      expect(trackingData).toEqual({
        page: {
          url: 'https://example.com/current-page?param=value',
          title: 'Current Page Title',
          path: '/current-page'
        },
        utm_params: {}
      })
    })
  })

  describe('dynamic behavior', () => {
    it('reflects changes in window.location for default page', () => {
      const page = new Page()

      // Initial state
      expect(page.url).toBe('https://example.com/current-page?param=value')
      expect(page.path).toBe('/current-page')

      // Change window location
      window.location.href = 'https://example.com/new-page'
      window.location.pathname = '/new-page'

      // Should reflect new values
      expect(page.url).toBe('https://example.com/new-page')
      expect(page.path).toBe('/new-page')
    })

    it('reflects changes in document.title', () => {
      const page = new Page()

      expect(page.title).toBe('Current Page Title')

      document.title = 'New Title'
      expect(page.title).toBe('New Title')
    })

    it('custom URL page does not change with window.location', () => {
      const customUrl = 'https://static.com/fixed-path'
      const page = new Page(customUrl)

      expect(page.url).toBe(customUrl)
      expect(page.path).toBe('/fixed-path')

      // Change window location
      window.location.href = 'https://example.com/different'
      window.location.pathname = '/different'

      // Custom URL page should remain unchanged
      expect(page.url).toBe(customUrl)
      expect(page.path).toBe('/fixed-path')
    })
  })
})
