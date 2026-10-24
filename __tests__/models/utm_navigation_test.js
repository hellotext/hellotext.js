/**
 * @jest-environment jsdom
 */

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

jest.mock('../../src/models/cookies')

describe('UTM arrival and in-site navigation', () => {
  const now = '2026-10-24T18:00:00.000Z'
  const documentStart = Date.parse('2026-10-24T17:59:00.000Z')
  const ad = '?utm_source=google&utm_medium=cpc&utm_campaign=brand'
  const popup = '?utm_source=pop_up_tv&utm_medium=pop_up_tv&utm_campaign=pop_up_tv'
  const hellotext = '?utm_source=hellotext&utm_medium=whatsapp&utm_campaign=product_recommender'

  let cookies
  let navigationEntry

  const visit = ({ search, loadedWith = search, referrer = '', type = 'navigate', hostname = 'www.store.com' }) => {
    window.location = { search, hostname }
    navigationEntry = { name: `https://${hostname}/landing${loadedWith}`, type }
    Object.defineProperty(document, 'referrer', { value: referrer, configurable: true })

    return new UTM()
  }

  const written = name => Cookies.set.mock.calls.filter(([cookie]) => cookie === name).map(([, value]) => JSON.parse(value))

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(now))
    jest.clearAllMocks()

    cookies = {}
    Cookies.get = jest.fn(name => cookies[name])
    Cookies.set = jest.fn((name, value) => (cookies[name] = value))
    Cookies.delete = jest.fn(name => delete cookies[name])

    delete window.location
    window.performance.getEntriesByType = jest.fn(type => (type === 'navigation' ? [navigationEntry] : []))
    Object.defineProperty(window.performance, 'timeOrigin', { value: documentStart, configurable: true })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('arrivals', () => {
    it('stores the UTM the visitor arrived with from another site', () => {
      visit({ search: ad, referrer: 'https://www.instagram.com/' })

      expect(written('hello_utm')).toEqual([{ source: 'google', medium: 'cpc', campaign: 'brand', observed_at: now }])
      expect(written('hello_utm_internal')).toEqual([])
    })

    it('stores the UTM of a visit with no referrer', () => {
      visit({ search: ad })

      expect(written('hello_utm')).toHaveLength(1)
    })

    it('keeps a same-site redirect that carries the same UTMs as the arrival', () => {
      visit({ search: ad, referrer: `https://www.store.com/${ad}` })

      expect(written('hello_utm')).toHaveLength(1)
      expect(written('hello_utm_internal')).toEqual([])
    })

    it('clears the in-site UTM of the previous visit', () => {
      cookies.hello_utm_internal = JSON.stringify({ source: 'pop_up_tv', medium: 'pop_up_tv', observed_at: '2026-10-20T10:00:00.000Z' })

      visit({ search: ad })

      expect(Cookies.delete).toHaveBeenCalledWith('hello_utm_internal')
    })
  })

  describe('in-site UTMs', () => {
    it('keeps the arrival when a single-page store navigates to a link with UTMs', () => {
      cookies.hello_utm = JSON.stringify({ source: 'hellotext', medium: 'whatsapp', observed_at: '2026-10-24T17:59:30.000Z' })

      visit({ search: popup, loadedWith: '' })

      expect(written('hello_utm')).toEqual([])
      expect(written('hello_utm_internal')).toEqual([
        { source: 'pop_up_tv', medium: 'pop_up_tv', campaign: 'pop_up_tv', observed_at: now },
      ])
    })

    it('keeps the arrival when a reloading store opens its own link from another page of the site', () => {
      visit({ search: popup, referrer: 'https://www.store.com/tv/samsung-55' })

      expect(written('hello_utm')).toEqual([])
      expect(written('hello_utm_internal')).toHaveLength(1)
    })

    it('treats another subdomain of the store as the same site', () => {
      visit({ search: popup, referrer: 'https://blog.store.com/post' })

      expect(written('hello_utm')).toEqual([])
      expect(written('hello_utm_internal')).toHaveLength(1)
    })

    it('treats a single-page navigation to different UTMs as in-site even after an ad arrival', () => {
      visit({ search: popup, loadedWith: ad })

      expect(written('hello_utm')).toEqual([])
      expect(written('hello_utm_internal')).toHaveLength(1)
    })

    it('keeps the first time the same in-site UTM was seen', () => {
      cookies.hello_utm_internal = JSON.stringify({ source: 'pop_up_tv', medium: 'pop_up_tv', campaign: 'pop_up_tv', observed_at: '2026-10-24T17:59:30.000Z' })

      visit({ search: popup, loadedWith: '' })

      expect(Cookies.set).not.toHaveBeenCalled()
    })

    it('stays in-site when a reloading store keeps the in-site UTMs on the next page', () => {
      cookies.hello_utm = JSON.stringify({ source: 'google', medium: 'cpc', campaign: 'brand', observed_at: '2026-10-24T17:00:00.000Z' })
      cookies.hello_utm_internal = JSON.stringify({ source: 'pop_up_tv', medium: 'pop_up_tv', campaign: 'pop_up_tv', observed_at: '2026-10-24T17:30:00.000Z' })

      visit({ search: popup, referrer: `https://www.store.com/tv${popup}` })

      expect(Cookies.set).not.toHaveBeenCalled()
      expect(Cookies.delete).not.toHaveBeenCalled()
      expect(JSON.parse(cookies.hello_utm)).toMatchObject({ source: 'google', observed_at: '2026-10-24T17:00:00.000Z' })
    })

    it('treats the in-site UTMs as an arrival when the visitor comes back from outside the site', () => {
      cookies.hello_utm_internal = JSON.stringify({ source: 'pop_up_tv', medium: 'pop_up_tv', campaign: 'pop_up_tv', observed_at: '2026-10-20T10:00:00.000Z' })

      visit({ search: popup, referrer: 'https://mail.google.com/' })

      expect(written('hello_utm')).toEqual([{ source: 'pop_up_tv', medium: 'pop_up_tv', campaign: 'pop_up_tv', observed_at: now }])
    })
  })

  describe('Hellotext UTMs', () => {
    it('stores a Hellotext link opened inside the store as the arrival', () => {
      cookies.hello_utm = JSON.stringify({ source: 'google', medium: 'cpc', observed_at: '2026-10-24T17:59:30.000Z' })

      visit({ search: hellotext, loadedWith: '', referrer: 'https://www.store.com/' })

      expect(written('hello_utm')).toEqual([
        { source: 'hellotext', medium: 'whatsapp', campaign: 'product_recommender', observed_at: now },
      ])
      expect(written('hello_utm_internal')).toEqual([])
    })

    it('keeps the time of a Hellotext UTM read again in the same document', () => {
      cookies.hello_utm = JSON.stringify({ source: 'hellotext', medium: 'whatsapp', campaign: 'product_recommender', observed_at: '2026-10-24T17:59:30.000Z' })

      visit({ search: hellotext, loadedWith: '' })

      expect(Cookies.set).not.toHaveBeenCalled()
    })
  })

  describe('observation time', () => {
    const storedAd = observedAt => JSON.stringify({ source: 'google', medium: 'cpc', campaign: 'brand', observed_at: observedAt })

    it('keeps the time when the same arrival is read again in this document', () => {
      cookies.hello_utm = storedAd('2026-10-24T17:59:30.000Z')

      visit({ search: ad })

      expect(Cookies.set).not.toHaveBeenCalled()
    })

    it('keeps the time on a reload', () => {
      cookies.hello_utm = storedAd('2026-10-20T10:00:00.000Z')

      visit({ search: ad, type: 'reload' })

      expect(Cookies.set).not.toHaveBeenCalled()
    })

    it('keeps the time on a back or forward navigation', () => {
      cookies.hello_utm = storedAd('2026-10-20T10:00:00.000Z')

      visit({ search: ad, type: 'back_forward' })

      expect(Cookies.set).not.toHaveBeenCalled()
    })

    it('stamps a new time for a new click on the same link', () => {
      cookies.hello_utm = storedAd('2026-10-20T10:00:00.000Z')

      visit({ search: ad, referrer: 'https://www.google.com/' })

      expect(written('hello_utm')).toEqual([{ source: 'google', medium: 'cpc', campaign: 'brand', observed_at: now }])
    })

    it("keeps the time when a reloading store keeps the arrival's UTMs on the next page", () => {
      cookies.hello_utm = storedAd('2026-10-24T17:00:00.000Z')

      visit({ search: ad, referrer: `https://www.store.com/category${ad}` })

      expect(Cookies.set).not.toHaveBeenCalled()
    })
  })

  describe('without navigation timing', () => {
    it('treats the current address as the one the document was loaded with', () => {
      window.performance.getEntriesByType = undefined
      window.location = { search: ad, hostname: 'www.store.com' }
      Object.defineProperty(document, 'referrer', { value: '', configurable: true })

      new UTM()

      expect(written('hello_utm')).toHaveLength(1)
    })
  })

  describe('internal getter', () => {
    it('returns the stored in-site UTM', () => {
      cookies.hello_utm_internal = JSON.stringify({ source: 'pop_up_tv', medium: 'pop_up_tv' })
      window.location = { search: '', hostname: 'www.store.com' }

      expect(new UTM().internal).toEqual({ source: 'pop_up_tv', medium: 'pop_up_tv' })
    })

    it('returns an empty object without one', () => {
      window.location = { search: '', hostname: 'www.store.com' }

      expect(new UTM().internal).toEqual({})
    })
  })
})
