/**
 * @jest-environment jsdom
 */

import { Locale } from '../../../src/core/configuration/locale'

describe('Locale', () => {
  beforeEach(() => {
    Locale._identifier = undefined
  })

  describe('identifier setter and getter', () => {
    it('sets and gets the identifier explicitly', () => {
      Locale.identifier = 'es'
      expect(Locale.identifier).toBe('es')
    })

    it('allows changing the identifier', () => {
      Locale.identifier = 'fr'
      expect(Locale.identifier).toBe('fr')

      Locale.identifier = 'en'
      expect(Locale.identifier).toBe('en')
    })

    it('falls back to "en" when nothing is set', () => {
      expect(Locale.identifier).toBe('en')
    })
  })

  describe('toString method', () => {
    it('returns the same value as identifier getter', () => {
      Locale.identifier = 'es'
      expect(Locale.toString()).toBe('es')
      expect(Locale.toString()).toBe(Locale.identifier)
    })
  })

  describe('auto-detection fallback', () => {
    it('falls back to "en" when nothing is set', () => {
      document.documentElement.lang = ''

      const originalQuerySelector = document.querySelector
      document.querySelector = jest.fn().mockReturnValue(null)

      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: undefined
      })

      expect(Locale.identifier).toBe('en')
      document.querySelector = originalQuerySelector
    })

    it('uses HTML lang attribute when available', () => {
      document.documentElement.lang = 'es'
      expect(Locale.identifier).toBe('es')
    })

    it('uses meta locale when HTML lang is empty', () => {
      document.documentElement.lang = ''

      const mockMetaElement = { content: 'fr' }
      document.querySelector = jest.fn().mockReturnValue(mockMetaElement)

      expect(Locale.identifier).toBe('fr')
      expect(document.querySelector).toHaveBeenCalledWith('meta[name="locale"]')
    })

    it('uses browser language when HTML and meta are empty', () => {
      document.documentElement.lang = ''
      document.querySelector = jest.fn().mockReturnValue(null)

      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'de-DE'
      })

      expect(Locale.identifier).toBe('de')
    })
  })

  describe('priority order', () => {
    it('prioritizes explicit setting over everything', () => {
      Locale.identifier = 'en'

      document.documentElement.lang = 'es'
      document.querySelector = jest.fn().mockReturnValue({ content: 'fr' })
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'de-DE'
      })

      expect(Locale.identifier).toBe('en')
    })

    it('prioritizes HTML lang over meta and browser', () => {
      document.documentElement.lang = 'es'
      document.querySelector = jest.fn().mockReturnValue({ content: 'fr' })
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'de-DE'
      })

      expect(Locale.identifier).toBe('es')
    })

    it('prioritizes meta over browser language', () => {
      document.documentElement.lang = ''
      document.querySelector = jest.fn().mockReturnValue({ content: 'fr' })
      Object.defineProperty(navigator, 'language', {
        writable: true,
        value: 'de-DE'
      })

      expect(Locale.identifier).toBe('fr')
    })
  })
})
