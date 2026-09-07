import { PopupDisplayRules } from '../../src/models/popup_display_rules'

function rules(...lanes) {
  return new PopupDisplayRules({
    lanes: lanes.map(lane => lane.map(([field, operator, values]) => ({ field, operator, values: [].concat(values) }))),
  })
}

const page = context => ({ url: 'https://shop.test', path: '/', title: '', ...context })

describe('PopupDisplayRules', () => {
  it('matches everything when the payload carries no lanes', () => {
    expect(new PopupDisplayRules({ lanes: [] }).matches(page())).toBe(true)
    expect(new PopupDisplayRules(undefined).matches(page())).toBe(true)
    expect(new PopupDisplayRules({}).matches(page())).toBe(true)
  })

  it('requires every condition inside one lane', () => {
    const definition = rules([['page.path', 'contains', '/sale'], ['page.title', 'contains', 'shoes']])

    expect(definition.matches(page({ path: '/sale/shoes', title: 'Running shoes' }))).toBe(true)
    expect(definition.matches(page({ path: '/sale/shoes', title: 'Running hats' }))).toBe(false)
  })

  it('matches when any lane matches', () => {
    const definition = rules([['page.path', 'contains', '/sale']], [['page.path', 'contains', '/outlet']])

    expect(definition.matches(page({ path: '/outlet/new' }))).toBe(true)
    expect(definition.matches(page({ path: '/blog' }))).toBe(false)
  })

  it('treats several values in one condition as alternatives', () => {
    const definition = rules([['page.path', 'contains', ['/sale', '/outlet']]])

    expect(definition.matches(page({ path: '/outlet' }))).toBe(true)
    expect(definition.matches(page({ path: '/blog' }))).toBe(false)
  })

  it('compares strings case-insensitively', () => {
    expect(rules([['page.title', 'contains', 'SHOES']]).matches(page({ title: 'Running shoes' }))).toBe(true)
  })

  it('supports the prefix and suffix operators', () => {
    expect(rules([['page.path', 'starts_with', '/sa']]).matches(page({ path: '/sale' }))).toBe(true)
    expect(rules([['page.path', 'ends_with', 'le']]).matches(page({ path: '/sale' }))).toBe(true)
    expect(rules([['page.path', 'is', '/sale']]).matches(page({ path: '/sale' }))).toBe(true)
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

    it('does not match before a measurement exists', () => {
      expect(rules([['session.time_on_page', 'at_least', 5]]).matches(page())).toBe(false)
    })

    it('reports whether the runtime has to keep re-checking', () => {
      expect(rules([['session.scroll_depth', 'at_least', 50]]).needsMeasurements).toBe(true)
      expect(rules([['session.time_on_page', 'at_least', 5]]).needsMeasurements).toBe(true)
      expect(rules([['page.path', 'contains', '/sale']]).needsMeasurements).toBe(false)
      expect(new PopupDisplayRules({ lanes: [] }).needsMeasurements).toBe(false)
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
})
