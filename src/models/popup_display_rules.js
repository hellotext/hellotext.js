/**
 * Evaluates the page-scoped display rules the server hands to the browser.
 *
 * The payload is `{ lanes: [[condition, ...], ...] }`: lanes are OR'd, conditions inside a
 * lane are AND'd. Only lanes that already survived server-side evaluation are sent, and
 * every visitor condition has been stripped, so this can treat the payload as the whole
 * remaining question.
 *
 * No lanes means the popup may display: either it has no rules, or every rule was already
 * satisfied on the server.
 *
 * This mirrors Popup::DisplayRules::PageEvaluator on the Rails side. Keep the two in step
 * — the shared cases are covered by both suites.
 */
const NEGATIVE_OPERATORS = ['does_not_contain', 'is_not']

const THRESHOLD_FIELDS = ['session.scroll_depth', 'session.time_on_page', 'session.page_views']
const STRING_FIELDS = [
  'page.url',
  'page.path',
  'page.title',
  'session.referrer',
  'session.language',
  'session.visitor_type',
  'session.browser',
  'session.utm_source',
  'session.utm_medium',
  'session.utm_campaign',
]
const EVENT_FIELDS = [
  'activity.product_viewed',
  'activity.cart_added',
  'activity.purchase_completed',
  'activity.form_completed',
]
// Text-typed fields whose values come from a fixed list. Kept in step with
// Popup::DisplayRules::Catalog on the Rails side.
const CLOSED_STRING_VALUES = {
  'session.language': ['en', 'es', 'pt', 'fr', 'nl', 'ht'],
  'session.visitor_type': ['new', 'returning'],
  'session.browser': ['chrome', 'safari', 'firefox', 'edge'],
}
const THRESHOLD_RANGES = {
  'session.scroll_depth': [1, 100],
  'session.time_on_page': [1, 3600],
  'session.page_views': [1, 1000],
}
const MAX_STRING_VALUE_LENGTH = 512
const STRING_OPERATORS = [
  'contains',
  'does_not_contain',
  'is',
  'is_not',
  'starts_with',
  'ends_with',
]

export class PopupDisplayRules {
  constructor(payload) {
    // An explicit empty lane list means universal eligibility. Anything else that does
    // not conform to the public payload shape must fail closed: treating a missing or
    // malformed `lanes` property as the same thing would expose a popup unexpectedly.
    this.valid =
      payload !== null &&
      typeof payload === 'object' &&
      !Array.isArray(payload) &&
      Array.isArray(payload.lanes)
    this.lanes = (this.valid ? payload.lanes : []).map(lane => {
      // An empty lane is intentional: it means the server already satisfied every
      // visitor-only condition. Any other malformed lane must fail closed instead of
      // accidentally becoming that universal match.
      return Array.isArray(lane) ? lane : [null]
    })
  }

  get empty() {
    return this.valid && this.lanes.length === 0
  }

  /**
   * True when the popup requires a measurement that only grows over time, so the runtime
   * knows it has to keep re-checking instead of deciding once on connect.
   */
  get needsMeasurements() {
    return this.lanes.some(lane =>
      lane.some(condition => THRESHOLD_FIELDS.includes(condition?.field)),
    )
  }

  get needsNavigation() {
    return this.lanes.some(lane => lane.some(condition => this.validCondition(condition)))
  }

  get needsActivities() {
    return this.lanes.some(lane => lane.some(condition => EVENT_FIELDS.includes(condition?.field)))
  }

  matches(context) {
    if (!this.valid) return false
    if (this.empty) return true

    return this.lanes.some(lane =>
      lane.every(condition => this.conditionMatches(condition, context)),
    )
  }

  conditionMatches(condition, context) {
    if (!this.validCondition(condition)) return false

    if (EVENT_FIELDS.includes(condition.field)) {
      return (
        context.activities?.has?.(condition.field) ||
        context.activities?.includes?.(condition.field)
      )
    }

    const actual = this.actualValue(condition.field, context)

    if (THRESHOLD_FIELDS.includes(condition.field)) {
      return this.thresholdMatches(condition, actual)
    }

    return this.stringMatches(condition, actual)
  }

  actualValue(field, context) {
    switch (field) {
      case 'page.url':
        return context.url
      case 'page.path':
        return context.path
      case 'page.title':
        return context.title
      case 'session.referrer':
        return context.referrer
      case 'session.scroll_depth':
        return context.scrollDepth
      case 'session.time_on_page':
        return context.timeOnPage
      case 'session.page_views':
        return context.pageViews
      case 'session.language':
        return context.language
      case 'session.visitor_type':
        return context.visitorType
      case 'session.browser':
        return context.browser
      case 'session.utm_source':
        return context.utm?.source
      case 'session.utm_medium':
        return context.utm?.medium
      case 'session.utm_campaign':
        return context.utm?.campaign
      default:
        return undefined
    }
  }

  validCondition(condition) {
    if (!condition || typeof condition !== 'object' || !Array.isArray(condition.values))
      return false

    if (THRESHOLD_FIELDS.includes(condition.field)) {
      const value = condition.values[0]
      const numericValue = Number(value)
      const [minimum, maximum] = THRESHOLD_RANGES[condition.field]

      return (
        condition.operator === 'at_least' &&
        condition.values.length === 1 &&
        (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) &&
        Number.isInteger(numericValue) &&
        numericValue >= minimum &&
        numericValue <= maximum
      )
    }

    if (EVENT_FIELDS.includes(condition.field)) {
      return condition.operator === 'occurred' && condition.values.length === 0
    }

    const validStrings =
      STRING_FIELDS.includes(condition.field) &&
      STRING_OPERATORS.includes(condition.operator) &&
      condition.values.length > 0 &&
      condition.values.every(
        value =>
          typeof value === 'string' &&
          value.trim().length > 0 &&
          value.length <= MAX_STRING_VALUE_LENGTH,
      )

    if (!validStrings) return false

    // Closed sets are checked here as well as on the server. A value outside the set could
    // only come from a tampered payload, and an unknown one must not ride along into an
    // `is not` and quietly widen who the popup reaches.
    const allowed = CLOSED_STRING_VALUES[condition.field]

    return !allowed || condition.values.every(value => allowed.includes(value))
  }

  thresholdMatches(condition, actual) {
    if (actual === undefined || actual === null || actual === '') return false

    return Number(actual) >= Number(condition.values[0])
  }

  /**
   * A missing value satisfies a negative operator and fails a positive one. Treating it as
   * an empty string would make "title contains x" and "title does not contain x" agree,
   * which breaks the exact complement the rules promise.
   */
  stringMatches(condition, actual) {
    const negative = NEGATIVE_OPERATORS.includes(condition.operator)

    if (actual === undefined || actual === null) return negative

    const value = String(actual).toLowerCase()
    const hit = condition.values.some(expected =>
      this.compare(condition.operator, value, String(expected).toLowerCase()),
    )

    return negative ? !hit : hit
  }

  compare(operator, actual, expected) {
    switch (operator) {
      case 'contains':
      case 'does_not_contain':
        return actual.includes(expected)
      case 'is':
      case 'is_not':
        return actual === expected
      case 'starts_with':
        return actual.startsWith(expected)
      case 'ends_with':
        return actual.endsWith(expected)
      default:
        return false
    }
  }
}

export default PopupDisplayRules
