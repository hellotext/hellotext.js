import { Cookies } from './cookies'
import { Page } from './page'

const UTM_KEYS = ['source', 'medium', 'campaign', 'term', 'content']
const ARRIVAL_COOKIE = 'hello_utm'
const IN_SITE_COOKIE = 'hello_utm_internal'

/**
 * Reads the UTM parameters on the current URL and keeps the click that
 * brought the visitor to the site.
 *
 * A UTM is an arrival when it is on the URL the document was loaded with and
 * the visitor did not come from another page of the same site. It is stored in
 * `hello_utm`, sent with every event as `utm_params`, and announced with
 * `utm-set`.
 *
 * Any other UTM was picked up while the visitor was already browsing the site:
 * the store's own popup, banner or menu links often carry UTMs. Letting those
 * replace the arrival would hand the sale to the store's own link, so they are
 * stored apart in `hello_utm_internal` and sent as `internal_utm_params`,
 * where the server can still recognise them when a commerce platform reports
 * the same UTM on the order. Two signals mark them, whatever the store:
 * - single-page stores navigate without reloading, so the UTM differs from the
 *   one on the URL the document was loaded with;
 * - stores that reload report the page the visitor came from, so the referrer
 *   is another page of the same site with different UTMs.
 *
 * Hellotext's own UTMs are never in-site: a Hellotext link opened inside the
 * store, from the webchat for example, is our click.
 *
 * `observed_at` is when the click happened. Reading the same UTM again keeps
 * it: single-page stores build a new Page for every tracked event, and a reload
 * or a back navigation is not a new click. Only a new navigation to the URL
 * stamps a new time.
 */
class UTM {
  constructor() {
    const utms = UTM.fromSearch(window.location.search)
    if (!utms) return

    if (UTM.isArrival(utms)) {
      this.saveArrival(utms)
    } else if (UTM.isHellotext(utms)) {
      this.saveHellotext(utms)
    } else {
      this.saveIfChanged(IN_SITE_COOKIE, utms)
    }
  }

  /**
   * Stores the given UTM parameters as the visitor's current click, observed
   * now. Callers use it for clicks they know are Hellotext's, such as a
   * webchat product card.
   * @param {Object} utmParams
   */
  save(utmParams) {
    this.recordClick(utmParams)
  }

  /**
   * The click that brought the visitor, as sent with events in `utm_params`.
   * @returns {Object}
   */
  get current() {
    return UTM.read(ARRIVAL_COOKIE)
  }

  /**
   * The last UTM picked up while browsing the site, sent with events in
   * `internal_utm_params`.
   * @returns {Object}
   */
  get internal() {
    return UTM.read(IN_SITE_COOKIE)
  }

  /**
   * Stores an arrival unless it is the one already stored and this is not a
   * new click on it: it was stored during this document, this document is a
   * reload or a back or forward navigation, or the visitor came from another
   * page of this site whose links kept the arrival's UTMs.
   */
  saveArrival(utms) {
    const stored = this.current
    const sameClick =
      UTM.restored(utms) || UTM.observedDuringThisDocument(stored) || Boolean(UTM.sameSiteReferrer)

    if (UTM.same(utms, stored) && sameClick) return

    this.recordClick(utms)
  }

  /**
   * Stores a Hellotext click opened from inside the store. Reading it again
   * during this document, or on a reload or a back or forward navigation that
   * restores its URL, keeps its time. Anything else is a new click even when
   * an earlier visit stored the same campaign: the cookie lives for years, and
   * `utm-set` must fire again so integrations restamp the order with the fresh
   * click.
   */
  saveHellotext(utms) {
    const stored = this.current

    if (UTM.same(utms, stored) && (UTM.restored(utms) || UTM.observedDuringThisDocument(stored)))
      return

    this.recordClick(utms)
  }

  /**
   * Records a new click as the visitor's current one, whether an arrival, a
   * Hellotext link opened in the store or an explicit save. The in-site UTM
   * described the browsing before it, so it is cleared rather than sent along
   * with the new click on every event.
   */
  recordClick(utms) {
    if (!this.write(ARRIVAL_COOKIE, utms)) return
    if (Object.keys(this.internal).length) Cookies.delete(IN_SITE_COOKIE)
  }

  saveIfChanged(cookie, utms) {
    if (UTM.same(utms, UTM.read(cookie))) return

    this.write(cookie, utms)
  }

  /**
   * Writes the UTM parameters to the cookie, observed now. Returns whether
   * they had the source and medium needed to be written.
   */
  write(cookie, utmParams) {
    if (!utmParams.source || !utmParams.medium) return false

    const cleanUtms = Object.fromEntries(
      Object.entries(utmParams).filter(([key, value]) => value && key !== 'observed_at'),
    )
    cleanUtms.observed_at = new Date().toISOString()

    Cookies.set(cookie, JSON.stringify(cleanUtms))
    return true
  }

  /**
   * The UTM parameters in a query string, or null without both a source and a
   * medium.
   */
  static fromSearch(search) {
    const params = new URLSearchParams(search || '')
    const utms = Object.fromEntries(
      UTM_KEYS.map(key => [key, params.get(`utm_${key}`)]).filter(([_, value]) => value),
    )

    return utms.source && utms.medium ? utms : null
  }

  /**
   * On the URL the document was loaded with, and either reached from outside
   * the site or handed over from another page of this site that carried the
   * same UTMs: a redirect that keeps the query is still the arrival.
   *
   * The stored in-site UTMs stay in-site in two cases, because neither is a
   * new click: the visitor browses on from the store's own link (pagination
   * and filters often keep the query), or a reload or a back or forward
   * navigation restores a URL they were already on. A single-page store
   * reloaded on the store's link loads the document with its UTMs while the
   * referrer is still the one the visit started with. A new navigation from
   * outside the site with the same UTMs is still an arrival.
   */
  static isArrival(utms) {
    if (!UTM.same(utms, UTM.fromSearch(UTM.documentSearch))) return false

    const referrer = UTM.sameSiteReferrer
    const inSite = UTM.same(utms, UTM.read(IN_SITE_COOKIE))
    if (inSite && (referrer || UTM.restored(utms))) return false
    if (!referrer) return true

    return UTM.same(utms, UTM.fromSearch(referrer.search))
  }

  static isHellotext(utms) {
    return String(utms.source).toLowerCase() === 'hellotext'
  }

  static same(a, b) {
    if (!a || !b) return false

    return UTM_KEYS.every(key => (a[key] || '') === (b[key] || ''))
  }

  static read(cookie) {
    try {
      return JSON.parse(Cookies.get(cookie)) || {}
    } catch (e) {
      return {}
    }
  }

  /**
   * The query string the document was loaded with. Single-page stores change
   * the address without loading a new document, and the navigation entry
   * keeps the original. Without it, the current address is the best answer.
   */
  static get documentSearch() {
    try {
      const entry = window.performance?.getEntriesByType?.('navigation')?.[0]
      if (entry?.name) return new URL(entry.name).search
    } catch (e) {
      // An unparsable entry falls back to the current address.
    }

    return window.location.search
  }

  /**
   * The referrer as a URL when it is another page of this site, compared by
   * root domain so subdomains of one store count as the same site.
   */
  static get sameSiteReferrer() {
    try {
      if (typeof document === 'undefined' || !document.referrer || !window.location.hostname)
        return null

      const referrer = new URL(document.referrer)
      const sameSite =
        Page.getRootDomain(referrer.hostname) === Page.getRootDomain(window.location.hostname)

      return sameSite ? referrer : null
    } catch (e) {
      return null
    }
  }

  /**
   * Whether these UTMs are on a URL that a reload or a back or forward
   * navigation restored. The navigation type describes the whole document,
   * so on a single-page store it stays "reload" for links opened afterwards;
   * only the UTMs on the URL the document was loaded with were restored.
   */
  static restored(utms) {
    return UTM.restoredNavigation && UTM.same(utms, UTM.fromSearch(UTM.documentSearch))
  }

  static get restoredNavigation() {
    try {
      const type = window.performance?.getEntriesByType?.('navigation')?.[0]?.type
      return type === 'reload' || type === 'back_forward'
    } catch (e) {
      return false
    }
  }

  static observedDuringThisDocument(stored) {
    const documentStart = window.performance?.timeOrigin
    const observedAt = Date.parse(stored?.observed_at)

    return Boolean(documentStart) && !Number.isNaN(observedAt) && observedAt >= documentStart
  }
}

export { UTM }
