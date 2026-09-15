import { PagePath } from '../../src/models/page_path'
import fixture from '../fixtures/page_path_cases.json'

describe('PagePath', () => {
  // The Rails editor and Popup::DisplayRules::PagePath run these same cases, which is what
  // keeps the path a merchant saves identical to the one the browser compares.
  it.each(fixture.cases)('canonicalizes %j', ({ mode, input, hosts = [], expected }) => {
    expect(PagePath.canonical(input, { mode, hosts })).toBe(expected)
  })

  it('reads contains and its exclusion as fragments and every other operator as a whole path', () => {
    expect(PagePath.modeFor('contains')).toBe(PagePath.CONTAINS)
    expect(PagePath.modeFor('does_not_contain')).toBe(PagePath.CONTAINS)
    expect(PagePath.modeFor('is')).toBe(PagePath.EXACT)
    expect(PagePath.modeFor('is_not')).toBe(PagePath.EXACT)
  })

  it('treats a missing value as empty', () => {
    expect(PagePath.canonical(undefined)).toBe('')
    expect(PagePath.canonical(null, { mode: PagePath.CONTAINS })).toBe('')
  })
})
