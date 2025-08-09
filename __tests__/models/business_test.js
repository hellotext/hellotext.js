/**
 * @jest-environment jsdom
 */

import { Business } from '../../src/models'

describe('Business', () => {
  let business

  beforeEach(() => {
    business = new Business('test-business-123')
  })

  afterEach(() => {
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => link.remove())
  })

  describe('constructor', () => {
    it('sets the business id', () => {
      expect(business.id).toEqual('test-business-123')
    })

    it('initializes data as null', () => {
      expect(business.data).toBeNull()
    })
  })

  describe('setData', () => {
    const mockData = {
      style_url: 'https://example.com/styles.css',
      subscription: 'premium',
      country: 'US',
      whitelist: ['example.com'],
      locale: 'en',
      features: { analytics: true }
    }

    it('sets the business data', () => {
      business.setData(mockData)
      expect(business.data).toEqual(mockData)
    })

    it('adds a stylesheet link to the document head', () => {
      // Clear any existing link tags
      document.head.innerHTML = ''

      business.setData(mockData)

      const linkTag = document.querySelector('link[rel="stylesheet"]')
      expect(linkTag).toBeTruthy()
      expect(linkTag.href).toBe('https://example.com/styles.css')
    })

    it('does not add stylesheet when document is undefined', () => {
      // Mock document as undefined (simulating server environment)
      const originalDocument = global.document
      global.document = undefined

      expect(() => {
        business.setData(mockData)
      }).not.toThrow()

      // Restore document
      global.document = originalDocument
    })

    it('handles setData with missing style_url gracefully', () => {
      const dataWithoutStyleUrl = {
        subscription: 'basic',
        country: 'CA'
      }

      // Should not throw even without style_url
      expect(() => {
        business.setData(dataWithoutStyleUrl)
      }).not.toThrow()

      expect(business.subscription).toBe('basic')
      expect(business.country).toBe('CA')
    })
  })

  describe('getters when data is set', () => {
    beforeEach(() => {
      business.setData({
        subscription: 'premium',
        country: 'US',
        whitelist: ['example.com'],
        locale: 'en',
        features: { analytics: true, whitelabel: false }
      })
    })

    describe('subscription', () => {
      it('returns the subscription from data', () => {
        expect(business.subscription).toBe('premium')
      })
    })

    describe('country', () => {
      it('returns the country from data', () => {
        expect(business.country).toBe('US')
      })
    })

    describe('features', () => {
      it('returns the features from data', () => {
        expect(business.features).toEqual({ analytics: true, whitelabel: false })
      })
    })

    describe('locale', () => {
      it('returns the English locale object for "en"', () => {
        const result = business.locale
        expect(result).toBeDefined()
        expect(result.white_label.powered_by).toBe('Powered by')
        expect(result.errors.blank).toBe('This field is required.')
      })

      it('returns the Spanish locale object for "es"', () => {
        business.setData({ locale: 'es' })
        const result = business.locale
        expect(result).toBeDefined()
        // The locale object should exist (even if we don't test all Spanish translations)
      })

      it('returns undefined for unsupported locale', () => {
        business.setData({ locale: 'fr' })
        expect(business.locale).toBeUndefined()
      })
    })

    describe('enabledWhitelist', () => {
      it('is true when the whitelist is an array', () => {
        business.setData({ whitelist: ['www.example.com'] })
        expect(business.enabledWhitelist).toBe(true)
      })

      it('is true when the whitelist is a non-disabled string', () => {
        business.setData({ whitelist: 'enabled' })
        expect(business.enabledWhitelist).toBe(true)
      })

      it('is false when the whitelist is "disabled"', () => {
        business.setData({ whitelist: 'disabled' })
        expect(business.enabledWhitelist).toBe(false)
      })

      it('is true when the whitelist is an empty array', () => {
        business.setData({ whitelist: [] })
        expect(business.enabledWhitelist).toBe(true)
      })
    })
  })

  describe('getters when data is null', () => {
    it('throws error when accessing subscription without data', () => {
      expect(() => business.subscription).toThrow()
    })

    it('throws error when accessing country without data', () => {
      expect(() => business.country).toThrow()
    })

    it('throws error when accessing features without data', () => {
      expect(() => business.features).toThrow()
    })

    it('throws error when accessing enabledWhitelist without data', () => {
      expect(() => business.enabledWhitelist).toThrow()
    })

    it('throws error when accessing locale without data', () => {
      expect(() => business.locale).toThrow()
    })
  })

  describe('edge cases', () => {
    it('handles multiple setData calls', () => {
      business.setData({ subscription: 'basic' })
      expect(business.subscription).toBe('basic')

      business.setData({ subscription: 'premium' })
      expect(business.subscription).toBe('premium')
    })

    it('handles setData with null values', () => {
      business.setData({
        subscription: null,
        country: null,
        whitelist: null,
        locale: null,
        features: null
      })

      expect(business.subscription).toBeNull()
      expect(business.country).toBeNull()
      expect(business.features).toBeNull()
      expect(business.locale).toBeUndefined() // locales[null] returns undefined
    })

    it('preserves existing DOM link tags when adding new stylesheet', () => {
      // Clean up document head first
      document.head.innerHTML = ''

      // Add an existing link tag
      const existingLink = document.createElement('link')
      existingLink.rel = 'stylesheet'
      existingLink.href = 'https://existing.com/style.css'
      document.head.appendChild(existingLink)

      business.setData({ style_url: 'https://example.com/styles.css' })

      const linkTags = document.querySelectorAll('link[rel="stylesheet"]')
      expect(linkTags.length).toBe(2)
      expect(linkTags[0].href).toBe('https://existing.com/style.css')
      expect(linkTags[1].href).toBe('https://example.com/styles.css')
    })
  })
})
