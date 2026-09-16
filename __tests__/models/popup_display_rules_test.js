import { PopupDisplayRules } from '../../src/models/popup_display_rules'

function rules(...lanes) {
  return new PopupDisplayRules({
    lanes: lanes.map(lane =>
      lane.map(([field, operator, values]) => ({ field, operator, values: [].concat(values) })),
    ),
  })
}

const page = context => ({ url: 'https://shop.test', path: '/', title: '', ...context })

describe('PopupDisplayRules', () => {
  it('matches everything when the payload carries no lanes', () => {
    expect(new PopupDisplayRules({ lanes: [] }).matches(page())).toBe(true)
  })

  it('fails closed unless the payload explicitly supplies a lanes array', () => {
    expect(new PopupDisplayRules(undefined).matches(page())).toBe(false)
    expect(new PopupDisplayRules(null).matches(page())).toBe(false)
    expect(new PopupDisplayRules({}).matches(page())).toBe(false)
    expect(new PopupDisplayRules({ lanes: null }).matches(page())).toBe(false)
    expect(new PopupDisplayRules({ lanes: {} }).matches(page())).toBe(false)
  })

  it('requires every distinct field inside one lane', () => {
    const definition = rules([
      ['page.path', 'contains', '/sale'],
      ['page.title', 'contains', 'shoes'],
    ])

    expect(definition.matches(page({ path: '/sale/shoes', title: 'Running shoes' }))).toBe(true)
    expect(definition.matches(page({ path: '/sale/shoes', title: 'Running hats' }))).toBe(false)
  })

  it('treats positive conditions for the same field as alternatives', () => {
    const definition = rules([
      ['page.path', 'is', '/return-policy'],
      ['page.path', 'contains', '/products/'],
    ])

    expect(definition.matches(page({ path: '/return-policy' }))).toBe(true)
    expect(definition.matches(page({ path: '/products/574-core' }))).toBe(true)
    expect(definition.matches(page({ path: '/blog' }))).toBe(false)
  })

  describe('Page URL spellings', () => {
    it('matches a saved path however the site spells the page', () => {
      const definition = rules([['page.path', 'is', '/sale']])

      expect(definition.matches(page({ path: '/sale/' }))).toBe(true)
      expect(definition.matches(page({ path: '/SALE' }))).toBe(true)
      expect(definition.matches(page({ path: '/sale/index.html' }))).toBe(true)
      expect(definition.matches(page({ path: '/sales' }))).toBe(false)
    })

    it('matches an accented path the browser reports percent-encoded', () => {
      expect(rules([['page.path', 'is', '/café']]).matches(page({ path: '/caf%C3%A9' }))).toBe(
        true,
      )
    })

    it('reads the route of a hash-routed site and ignores an in-page anchor', () => {
      const definition = rules([['page.path', 'is', '/products/42']])

      expect(definition.matches(page({ path: '/', hash: '#/products/42' }))).toBe(true)
      expect(definition.matches(page({ path: '/', hash: '#!/products/42' }))).toBe(true)
      expect(definition.matches(page({ path: '/products/42', hash: '#reviews' }))).toBe(true)
      expect(definition.matches(page({ path: '/', hash: '#top' }))).toBe(false)
    })

    it('uses the path from a full URL and fails closed for an ambiguous bare domain', () => {
      const definition = rules([['page.path', 'is', 'https://shop.test/sale']])

      expect(definition.matches(page({ url: 'https://shop.test/sale', path: '/sale' }))).toBe(true)
      expect(rules([['page.path', 'is', 'shop.test/sale']]).matches(page({ path: '/sale' }))).toBe(false)
    })

    it('does not turn an encoded slash into a path separator', () => {
      const definition = rules([['page.path', 'is', '/a%2Fb']])

      expect(definition.matches(page({ path: '/a%2Fb' }))).toBe(true)
      expect(definition.matches(page({ path: '/a/b' }))).toBe(false)
    })

    it('keeps a trailing slash typed into contains as the pages under that path', () => {
      const definition = rules([['page.path', 'contains', '/blog/']])

      expect(definition.matches(page({ path: '/blog/first-post' }))).toBe(true)
      expect(definition.matches(page({ path: '/blog' }))).toBe(false)
      expect(definition.matches(page({ path: '/blog-news' }))).toBe(false)
    })

    it('fails closed on a fragment that would match every page', () => {
      expect(rules([['page.path', 'contains', '/']]).matches(page({ path: '/sale' }))).toBe(false)
      expect(rules([['page.path', 'does_not_contain', '/']]).matches(page({ path: '/sale' }))).toBe(
        false,
      )
    })
  })

  // Campaign values are written into links by people and ad platforms, so rules cannot depend
  // on capitalization. Query strings are decoded before they reach this evaluator.
  describe('campaign spellings', () => {
    const visit = utm => page({ utm })

    it('ignores capitalization in every campaign field', () => {
      expect(
        rules([['session.utm_campaign', 'is', 'black friday']]).matches(
          visit({ campaign: 'Black Friday' }),
        ),
      ).toBe(true)
      expect(
        rules([['session.utm_source', 'is', 'Instagram']]).matches(visit({ source: 'instagram' })),
      ).toBe(true)
    })

    it('preserves a literal plus sign after the URL has been decoded', () => {
      const words = rules([['session.utm_campaign', 'is', 'black friday']])
      const plus = rules([['session.utm_campaign', 'is', 'black+friday']])

      expect(words.matches(visit({ campaign: 'Black Friday' }))).toBe(true)
      expect(plus.matches(visit({ campaign: 'Black+Friday' }))).toBe(true)
      expect(words.matches(visit({ campaign: 'Black+Friday' }))).toBe(false)
      expect(plus.matches(visit({ campaign: 'Black Friday' }))).toBe(false)
    })
  })

  it('requires all exclusions for the same field', () => {
    const definition = rules([
      ['page.path', 'does_not_contain', '/checkout'],
      ['page.path', 'is_not', '/cart'],
    ])

    expect(definition.matches(page({ path: '/products/574-core' }))).toBe(true)
    expect(definition.matches(page({ path: '/checkout' }))).toBe(false)
    expect(definition.matches(page({ path: '/cart' }))).toBe(false)
  })

  it('combines positive alternatives and exclusions with other fields', () => {
    const definition = rules([
      ['page.path', 'is', '/return-policy'],
      ['page.path', 'contains', '/products/'],
      ['page.path', 'does_not_contain', '/checkout'],
      ['page.title', 'contains', 'shoes'],
    ])

    expect(definition.matches(page({ path: '/products/574-core', title: 'Running shoes' }))).toBe(true)
    expect(definition.matches(page({ path: '/products/checkout', title: 'Running shoes' }))).toBe(false)
    expect(definition.matches(page({ path: '/products/574-core', title: 'Coats' }))).toBe(false)
  })

  // Every field authored as includable and excludable rows reads the same way, not just
  // Page URL: before this, the same rule on any other text field required both halves at
  // once and could never match.
  it('reads every list-valued field as alternatives plus exclusions', () => {
    const definition = rules([
      ['page.title', 'is', 'Sale'],
      ['page.title', 'contains', 'shoes'],
    ])

    expect(definition.matches(page({ title: 'Sale' }))).toBe(true)
    expect(definition.matches(page({ title: 'Running shoes' }))).toBe(true)
    expect(definition.matches(page({ title: 'Coats' }))).toBe(false)
  })

  // A threshold holds one number, so repeated conditions are requirements rather than
  // alternatives — treating them as alternatives would quietly widen who sees the popup.
  it('keeps fields that hold no list as ordinary AND conditions', () => {
    const definition = rules([
      ['session.scroll_depth', 'at_least', 50],
      ['session.scroll_depth', 'at_least', 80],
    ])

    expect(definition.matches(page({ scrollDepth: 90 }))).toBe(true)
    expect(definition.matches(page({ scrollDepth: 60 }))).toBe(false)
  })

  it('matches when any lane matches', () => {
    const definition = rules(
      [['page.path', 'contains', '/sale']],
      [['page.path', 'contains', '/outlet']],
    )

    expect(definition.matches(page({ path: '/outlet/new' }))).toBe(true)
    expect(definition.matches(page({ path: '/blog' }))).toBe(false)
  })

  it('treats several values in one condition as alternatives', () => {
    const definition = rules([['page.path', 'contains', ['/sale', '/outlet']]])

    expect(definition.matches(page({ path: '/outlet' }))).toBe(true)
    expect(definition.matches(page({ path: '/blog' }))).toBe(false)
  })

  it('compares strings case-insensitively', () => {
    expect(
      rules([['page.title', 'contains', 'SHOES']]).matches(page({ title: 'Running shoes' })),
    ).toBe(true)
  })

  // Prefix and suffix matching left the catalog: neither has a negative twin, so a row
  // carrying one could never be flipped to an exclusion in the editor.
  it('rejects removed fields and the operators that lost their twin', () => {
    expect(rules([['page.url', 'contains', 'shop.test']]).matches(page())).toBe(false)

    for (const field of ['page.path', 'page.title', 'session.referrer']) {
      const value = field === 'page.path' ? '/sale' : 'Sale'
      const context = field === 'page.path' ? { path: '/sale' } : { [field.split('.')[1]]: 'Sale' }

      expect(rules([[field, 'starts_with', value.slice(0, 2)]]).matches(page(context))).toBe(false)
      expect(rules([[field, 'ends_with', value.slice(-2)]]).matches(page(context))).toBe(false)
    }
  })

  // A closed set matches a whole value or none of it, so a substring operator on one is a
  // condition the server would never have saved.
  it('rejects substring operators on closed sets', () => {
    expect(rules([['session.browser', 'contains', 'chr']]).matches(page({ browser: 'chrome' }))).toBe(false)
    expect(rules([['session.language', 'contains', 'e']]).matches(page({ language: 'es' }))).toBe(false)
  })

  describe('negative operators', () => {
    it('matches a page that does not carry the value', () => {
      const definition = rules([['page.path', 'does_not_contain', '/cart']])

      expect(definition.matches(page({ path: '/sale' }))).toBe(true)
      expect(definition.matches(page({ path: '/cart' }))).toBe(false)
    })

    // Complement semantics: a visitor with no referrer satisfies "referrer is not google".
    it('matches when the value is missing entirely', () => {
      expect(rules([['session.referrer', 'does_not_contain', 'google']]).matches(page())).toBe(true)
    })

    it('fails a positive operator when the value is missing', () => {
      expect(rules([['session.referrer', 'contains', 'google']]).matches(page())).toBe(false)
    })
  })

  describe('thresholds', () => {
    it('matches once the measurement reaches the threshold', () => {
      const definition = rules([['session.scroll_depth', 'at_least', 50]])

      expect(definition.matches(page({ scrollDepth: 50 }))).toBe(true)
      expect(definition.matches(page({ scrollDepth: 80 }))).toBe(true)
      expect(definition.matches(page({ scrollDepth: 20 }))).toBe(false)
    })

    it('matches the number of pages viewed in the current visit', () => {
      expect(rules([['session.page_views', 'at_least', 3]]).matches(page({ pageViews: 3 }))).toBe(
        true,
      )
      expect(rules([['session.page_views', 'at_least', 3]]).matches(page({ pageViews: 2 }))).toBe(
        false,
      )
    })

    it('does not match before a measurement exists', () => {
      expect(rules([['session.time_on_page', 'at_least', 5]]).matches(page())).toBe(false)
    })

    // Mirrors spec/models/popup/display_rules/page_evaluator_spec.rb so the two copies of
    // this comparison cannot drift.
    it('compares a measurement from either side', () => {
      const expectations = {
        at_least: { 50: true, 49: false, 51: true },
        at_most: { 50: true, 49: true, 51: false },
        greater_than: { 50: false, 49: false, 51: true },
        less_than: { 50: false, 49: true, 51: false },
      }

      Object.entries(expectations).forEach(([operator, cases]) => {
        const definition = rules([['session.scroll_depth', operator, 50]])

        Object.entries(cases).forEach(([actual, expected]) => {
          expect(definition.matches(page({ scrollDepth: Number(actual) }))).toBe(expected)
        })
      })
    })

    // A range is two conditions, not a two-valued one: the lane already ANDs repeated
    // conditions on a threshold.
    it('reads a pair of bounds in one lane as a range', () => {
      const definition = rules([
        ['session.scroll_depth', 'at_least', 25],
        ['session.scroll_depth', 'at_most', 75],
      ])

      expect(definition.matches(page({ scrollDepth: 50 }))).toBe(true)
      expect(definition.matches(page({ scrollDepth: 25 }))).toBe(true)
      expect(definition.matches(page({ scrollDepth: 75 }))).toBe(true)
      expect(definition.matches(page({ scrollDepth: 24 }))).toBe(false)
      expect(definition.matches(page({ scrollDepth: 76 }))).toBe(false)
    })

    // The downward comparisons are the ones an absent measurement could wrongly satisfy:
    // zero is "at most 2", but nothing has been counted yet.
    it('does not satisfy a downward comparison before anything is measured', () => {
      expect(rules([['session.page_views', 'at_most', 2]]).matches(page())).toBe(false)
      expect(rules([['session.page_views', 'less_than', 2]]).matches(page())).toBe(false)
    })

    it('refuses a comparison the catalog does not offer', () => {
      expect(rules([['session.scroll_depth', 'between', 50]]).matches(page({ scrollDepth: 60 }))).toBe(
        false,
      )
    })

    it('reports whether the runtime has to keep re-checking', () => {
      expect(rules([['session.scroll_depth', 'at_least', 50]]).needsMeasurements).toBe(true)
      expect(rules([['session.time_on_page', 'at_least', 5]]).needsMeasurements).toBe(true)
      expect(rules([['page.path', 'contains', '/sale']]).needsMeasurements).toBe(false)
      expect(new PopupDisplayRules({ lanes: [] }).needsMeasurements).toBe(false)
    })
  })

  it('matches browser language, visitor type and persisted UTM values', () => {
    const context = page({
      language: 'es',
      visitorType: 'returning',
      utm: { source: 'instagram', medium: 'social', campaign: 'summer' },
    })

    expect(rules([['session.language', 'is', 'es']]).matches(context)).toBe(true)
    expect(rules([['session.visitor_type', 'is', 'returning']]).matches(context)).toBe(true)
    expect(rules([['session.utm_source', 'contains', 'insta']]).matches(context)).toBe(true)
    expect(rules([['session.utm_medium', 'is', 'social']]).matches(context)).toBe(true)
    expect(rules([['session.utm_campaign', 'contains', 'mer']]).matches(context)).toBe(true)
  })

  it('rejects visitor types outside the browser contract', () => {
    expect(
      rules([['session.visitor_type', 'is', 'sometimes']]).matches(
        page({ visitorType: 'sometimes' }),
      ),
    ).toBe(false)
  })

  it('rejects languages outside the Americas browser-language catalog', () => {
    expect(rules([['session.language', 'is', 'de']]).matches(page({ language: 'de' }))).toBe(
      false,
    )
  })

  it('matches the browser and excludes it', () => {
    const context = page({ browser: 'safari' })

    expect(rules([['session.browser', 'is', 'safari']]).matches(context)).toBe(true)
    expect(rules([['session.browser', 'is', 'chrome']]).matches(context)).toBe(false)
    expect(rules([['session.browser', 'is_not', 'chrome']]).matches(context)).toBe(true)
  })

  // A browser the runtime could not name reports nothing. `is` must not match on that, and
  // `is not` must, the way every other missing value behaves.
  it('treats an unnamed browser as a missing value', () => {
    expect(rules([['session.browser', 'is', 'chrome']]).matches(page({}))).toBe(false)
    expect(rules([['session.browser', 'is_not', 'chrome']]).matches(page({}))).toBe(true)
  })

  it('rejects a browser outside the closed set', () => {
    expect(
      rules([['session.browser', 'is', 'netscape']]).matches(page({ browser: 'netscape' })),
    ).toBe(false)
  })

  describe('activity conditions', () => {
    it('matches a supported activity observed in the current visit', () => {
      const definition = rules([['activity.product_viewed', 'occurred', []]])

      expect(
        definition.matches(page({ activities: new Set(['activity.product_viewed']) })),
      ).toBe(true)
      expect(definition.matches(page({ activities: new Set() }))).toBe(false)
      expect(definition.needsActivities).toBe(true)
    })

    it('fails closed for values or operators outside the event contract', () => {
      expect(
        rules([['activity.product_viewed', 'occurred', ['once']]]).matches(
          page({ activities: new Set(['activity.product_viewed']) }),
        ),
      ).toBe(false)
      expect(
        rules([['activity.product_viewed', 'is', []]]).matches(
          page({ activities: new Set(['activity.product_viewed']) }),
        ),
      ).toBe(false)
    })
  })

  // The server strips visitor conditions after deciding them, so a lane can arrive empty.
  // An empty lane is satisfied and the popup displays.
  it('treats a lane emptied by server-side evaluation as satisfied', () => {
    expect(new PopupDisplayRules({ lanes: [[]] }).matches(page())).toBe(true)
  })

  it('ignores a field it does not know instead of throwing', () => {
    expect(rules([['profile.country', 'is', 'uy']]).matches(page())).toBe(false)
  })

  it('fails closed for malformed lanes and conditions', () => {
    expect(new PopupDisplayRules({ lanes: [null] }).matches(page())).toBe(false)
    expect(new PopupDisplayRules({ lanes: [[null]] }).matches(page())).toBe(false)
    expect(
      new PopupDisplayRules({
        lanes: [[{ field: 'page.path', operator: 'does_not_contain', values: [] }]],
      }).matches(page()),
    ).toBe(false)
  })

  it('does not throw for malformed payloads', () => {
    expect(() =>
      new PopupDisplayRules({ lanes: [{ field: 'page.path' }] }).matches(page()),
    ).not.toThrow()
  })

  it('fails closed for values outside the catalog bounds', () => {
    expect(
      new PopupDisplayRules({
        lanes: [[{ field: 'session.scroll_depth', operator: 'at_least', values: [''] }]],
      }).matches(page({ scrollDepth: 100 })),
    ).toBe(false)
    expect(
      new PopupDisplayRules({
        lanes: [[{ field: 'session.time_on_page', operator: 'at_least', values: [3601] }]],
      }).matches(page({ timeOnPage: 3601 })),
    ).toBe(false)
    expect(
      new PopupDisplayRules({
        lanes: [[{ field: 'page.path', operator: 'contains', values: [' '] }]],
      }).matches(page()),
    ).toBe(false)
    expect(
      new PopupDisplayRules({
        lanes: [[{ field: 'page.path', operator: 'contains', values: ['a'.repeat(513)] }]],
      }).matches(page()),
    ).toBe(false)
  })
})
