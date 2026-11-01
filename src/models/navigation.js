import { Page } from './page'

/**
 * How the visitor reached the current document. Links the SDK reads from the
 * URL, such as UTMs and `hello_popup`, count only when the visitor followed
 * them: not when a reload or a back navigation restores the address, and not
 * when the store's own pages carry the query along.
 */
class Navigation {
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
   * Whether the document was loaded by a reload or a back or forward
   * navigation. The type describes the whole document, so on a single-page
   * store it stays "reload" for links opened afterwards.
   */
  static get restored() {
    try {
      const type = window.performance?.getEntriesByType?.('navigation')?.[0]?.type
      return type === 'reload' || type === 'back_forward'
    } catch (e) {
      return false
    }
  }
}

export { Navigation }
