"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PagePath = void 0;
/**
 * The one form a page path takes whenever a display rule compares it.
 *
 * A merchant types, pastes or picks a path; the browser reports `location.pathname`. The two
 * rarely agree byte for byte — a pasted URL carries its domain, a CMS adds a trailing slash,
 * the browser percent-encodes accents — and every such difference used to be a rule that
 * silently never matched. Both sides go through this function before they meet, so how
 * either one was written stops mattering.
 *
 * `exact` is a whole path: one leading slash, no trailing slash, dot segments resolved, so
 * `/Sale/`, `sale` and `https://shop.com/sale?x=1` all become `/sale`. `contains` is a
 * fragment: it keeps a trailing slash the merchant typed (`/blog/` means the pages under the
 * blog) and never gains a leading one (`rojo` must still match `/zapato-rojo`). A fragment
 * that reduces to nothing, or to `/`, would match every page, so it comes back empty for the
 * caller to refuse.
 *
 * Kept in step with Popup::DisplayRules::PagePath and app/javascript/lib/popup_page_path.js
 * in the Rails app. All three run the cases in __tests__/fixtures/page_path_cases.json.
 */
const EXACT = 'exact';
const CONTAINS = 'contains';
const CONTAINS_OPERATORS = ['contains', 'does_not_contain'];
const WEB_ORIGIN = /^https?:\/\/[^/?#]+/i;
const SCHEME_RELATIVE_ORIGIN = /^\/\/[^/?#]+/;
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;
const BARE_HOST_WITH_PATH = /^(?:(?:[a-z0-9-]+\.)+[a-z]{2,}|localhost)(?::\d+)?\//i;
const ENCODED_RUN = /(?:%[0-9a-f]{2})+/gi;
const RESERVED_ESCAPE = /%(?:21|23|24|25|26|27|28|29|2a|2b|2c|2f|3a|3b|3d|3f|40|5b|5d)/i;
const INDEX_FILE = /(^|\/)index\.(?:html?|php)$/;
class PagePath {
  static EXACT = EXACT;
  static CONTAINS = CONTAINS;
  static modeFor(operator) {
    return CONTAINS_OPERATORS.includes(operator) ? CONTAINS : EXACT;
  }
  static canonical(value, {
    mode = EXACT
  } = {}) {
    let path = String(value ?? '').trim();
    if (path === '') return '';
    path = this.withoutOrigin(path);
    if (path === null) return '';
    path = this.routePath(path);
    path = this.decoded(path);
    // Lowercasing can produce decomposed sequences, so NFC runs after it. The final sigma is
    // folded because JavaScript applies its word-final rule and Ruby does not.
    path = path.toLowerCase().replace(/ς/g, 'σ').normalize('NFC').replace(/\/{2,}/g, '/');
    const indexFile = INDEX_FILE.test(path);
    path = path.replace(INDEX_FILE, '$1');
    if (mode === CONTAINS) {
      // `/blog/index.html` names the blog page itself, not everything under it.
      if (indexFile) path = path.replace(/\/$/, '');
      return path === '/' ? '' : path;
    }
    return this.resolved(path);
  }

  // Only HTTP(S) values name pages the popup can observe. A bare domain with a path is
  // rejected instead of depending on the suggestion-host limit to decide its meaning.
  static withoutOrigin(path) {
    if (WEB_ORIGIN.test(path)) return path.replace(WEB_ORIGIN, '');
    if (SCHEME_RELATIVE_ORIGIN.test(path)) return path.replace(SCHEME_RELATIVE_ORIGIN, '');
    if (SCHEME.test(path) || BARE_HOST_WITH_PATH.test(path)) return null;
    return path;
  }

  // Hash-routed sites keep their real route after `#/` or `#!/`. Any other fragment is an
  // in-page anchor and names no page of its own, and a query never does.
  static routePath(path) {
    const hashAt = path.indexOf('#');
    const base = (hashAt === -1 ? path : path.slice(0, hashAt)).split('?')[0];
    const fragment = hashAt === -1 ? '' : path.slice(hashAt + 1);
    const route = fragment.startsWith('/') ? fragment : fragment.startsWith('!/') ? fragment.slice(1) : '';
    return route ? `${base}/${route.split('?')[0]}` : base;
  }

  // Decode readable characters but keep every reserved URL delimiter escaped. In particular,
  // `%2F` is not `/`: decoding it would turn one path segment into two.
  static decoded(path) {
    return path.replace(ENCODED_RUN, run => {
      const escapes = run.match(/%[0-9a-f]{2}/gi) ?? [];
      const groups = [];
      let group = [];
      const flush = () => {
        if (group.length > 0) groups.push(group.join(''));
        group = [];
      };
      escapes.forEach(escape => {
        if (RESERVED_ESCAPE.test(escape)) {
          flush();
          groups.push(escape);
        } else {
          group.push(escape);
        }
      });
      flush();
      return groups.map(group => {
        if (RESERVED_ESCAPE.test(group)) return group;
        try {
          return decodeURIComponent(group);
        } catch (_) {
          return group;
        }
      }).join('');
    });
  }
  static resolved(path) {
    const segments = [];
    path.split('/').forEach(segment => {
      if (segment === '' || segment === '.') return;
      if (segment === '..') segments.pop();else segments.push(segment);
    });
    return `/${segments.join('/')}`;
  }
}
exports.PagePath = PagePath;
var _default = PagePath;
exports.default = _default;