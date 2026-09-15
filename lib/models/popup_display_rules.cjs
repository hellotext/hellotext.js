"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PopupDisplayRules = void 0;
var _page_path = require("./page_path");
/**
 * Evaluates the page-scoped display rules the server hands to the browser.
 *
 * The payload is `{ lanes: [[condition, ...], ...] }`: lanes are OR'd and their conditions
 * are AND'd. Page URL is the one exception: repeated conditions for that field form a group
 * whose positive matches are alternatives and whose exclusions are cumulative. Only lanes
 * that already survived server-side evaluation are sent.
 *
 * No lanes means the popup may display: either it has no rules, or every rule was already
 * satisfied on the server.
 *
 * This mirrors Popup::DisplayRules::PageEvaluator on the Rails side. Keep the two in step
 * — the shared cases are covered by both suites.
 */

const NEGATIVE_OPERATORS = ['does_not_contain', 'is_not'];
const THRESHOLD_FIELDS = ['session.scroll_depth', 'session.time_on_page', 'session.page_views'];
// A measurement is compared from either side. Kept in step with
// Popup::DisplayRules::Catalog::THRESHOLD_OPERATORS — `between` is absent on both sides
// because a lane ANDs repeated conditions, so `at_least 25` beside `at_most 75` is it.
const THRESHOLD_OPERATORS = ['at_least', 'at_most', 'greater_than', 'less_than'];
const STRING_FIELDS = ['page.path', 'page.title', 'session.referrer', 'session.language', 'session.visitor_type', 'session.browser', 'session.utm_source', 'session.utm_medium', 'session.utm_campaign'];
const EVENT_FIELDS = ['activity.product_viewed', 'activity.cart_added', 'activity.purchase_completed', 'activity.form_completed'];
// Text-typed fields whose values come from a fixed list. Kept in step with
// Popup::DisplayRules::Catalog on the Rails side.
const CLOSED_STRING_VALUES = {
  'session.language': ['en', 'es', 'pt', 'fr', 'nl'],
  'session.visitor_type': ['new', 'returning'],
  'session.browser': ['chrome', 'safari', 'firefox', 'edge']
};
const THRESHOLD_RANGES = {
  'session.scroll_depth': [1, 100],
  'session.time_on_page': [1, 3600],
  'session.page_views': [1, 1000]
};
const MAX_STRING_VALUE_LENGTH = 512;
// Every operator a list-valued field offers comes in a positive/negative pair, so any
// authored row can be reversed. Kept in step with Popup::DisplayRules::Catalog on the
// Rails side, where `starts_with` and `ends_with` were dropped for lacking a twin.
const TEXT_OPERATORS = ['contains', 'does_not_contain', 'is', 'is_not'];
const ENTITY_OPERATORS = ['is', 'is_not'];
class PopupDisplayRules {
  constructor(payload) {
    // An explicit empty lane list means universal eligibility. Anything else that does
    // not conform to the public payload shape must fail closed: treating a missing or
    // malformed `lanes` property as the same thing would expose a popup unexpectedly.
    this.valid = payload !== null && typeof payload === 'object' && !Array.isArray(payload) && Array.isArray(payload.lanes);
    this.lanes = (this.valid ? payload.lanes : []).map(lane => {
      // An empty lane is intentional: it means the server already satisfied every
      // visitor-only condition. Any other malformed lane must fail closed instead of
      // accidentally becoming that universal match.
      return Array.isArray(lane) ? lane : [null];
    });
  }
  get empty() {
    return this.valid && this.lanes.length === 0;
  }

  /**
   * True when the popup requires a measurement that only grows over time, so the runtime
   * knows it has to keep re-checking instead of deciding once on connect.
   */
  get needsMeasurements() {
    return this.lanes.some(lane => lane.some(condition => THRESHOLD_FIELDS.includes(condition?.field)));
  }
  get needsNavigation() {
    return this.lanes.some(lane => lane.some(condition => this.validCondition(condition)));
  }
  get needsActivities() {
    return this.lanes.some(lane => lane.some(condition => EVENT_FIELDS.includes(condition?.field)));
  }
  matches(context) {
    if (!this.valid) return false;
    if (this.empty) return true;
    return this.lanes.some(lane => this.laneMatches(lane, context));
  }
  laneMatches(lane, context) {
    const groups = new Map();
    lane.forEach(condition => {
      const conditions = groups.get(condition?.field) || [];
      conditions.push(condition);
      groups.set(condition?.field, conditions);
    });
    return [...groups.entries()].every(([field, conditions]) => this.fieldGroupMatches(field, conditions, context));
  }

  // A list-valued field is authored one row at a time, so it can carry several sibling
  // conditions at once: the values included are alternatives and the ones excluded are
  // cumulative. Thresholds and events hold a single condition each and stay a flat AND.
  // `STRING_FIELDS` is this side's copy of the catalog's list-valued types — country is
  // visitor-scoped and never reaches the browser.
  fieldGroupMatches(field, conditions, context) {
    if (!STRING_FIELDS.includes(field)) {
      return conditions.every(condition => this.conditionMatches(condition, context));
    }
    const positives = conditions.filter(condition => !NEGATIVE_OPERATORS.includes(condition?.operator));
    const negatives = conditions.filter(condition => NEGATIVE_OPERATORS.includes(condition?.operator));
    return (positives.length === 0 || positives.some(condition => this.conditionMatches(condition, context))) && negatives.every(condition => this.conditionMatches(condition, context));
  }
  conditionMatches(condition, context) {
    if (!this.validCondition(condition)) return false;
    if (EVENT_FIELDS.includes(condition.field)) {
      return context.activities?.has?.(condition.field) || context.activities?.includes?.(condition.field);
    }
    const actual = this.actualValue(condition.field, context);
    if (THRESHOLD_FIELDS.includes(condition.field)) {
      return this.thresholdMatches(condition, actual);
    }
    if (condition.field === 'page.path') return this.pathMatches(condition, actual, context);
    return this.stringMatches(condition, actual);
  }
  actualValue(field, context) {
    switch (field) {
      // The hash rides along because a hash-routed site keeps its real route after `#/`.
      case 'page.path':
        return context.path === undefined || context.path === null ? context.path : `${context.path}${context.hash ?? ''}`;
      case 'page.title':
        return context.title;
      case 'session.referrer':
        return context.referrer;
      case 'session.scroll_depth':
        return context.scrollDepth;
      case 'session.time_on_page':
        return context.timeOnPage;
      case 'session.page_views':
        return context.pageViews;
      case 'session.language':
        return context.language;
      case 'session.visitor_type':
        return context.visitorType;
      case 'session.browser':
        return context.browser;
      case 'session.utm_source':
        return context.utm?.source;
      case 'session.utm_medium':
        return context.utm?.medium;
      case 'session.utm_campaign':
        return context.utm?.campaign;
      default:
        return undefined;
    }
  }
  validCondition(condition) {
    if (!condition || typeof condition !== 'object' || !Array.isArray(condition.values)) return false;
    if (THRESHOLD_FIELDS.includes(condition.field)) {
      const value = condition.values[0];
      const numericValue = Number(value);
      const [minimum, maximum] = THRESHOLD_RANGES[condition.field];
      return THRESHOLD_OPERATORS.includes(condition.operator) && condition.values.length === 1 && (typeof value === 'number' || typeof value === 'string' && /^\d+$/.test(value)) && Number.isInteger(numericValue) && numericValue >= minimum && numericValue <= maximum;
    }
    if (EVENT_FIELDS.includes(condition.field)) {
      return condition.operator === 'occurred' && condition.values.length === 0;
    }

    // A closed set matches a whole value or none of it, so it only offers the exact pair.
    // Mirrors the catalog's ENTITY_OPERATORS on the Rails side: accepting `contains` here
    // would evaluate a condition the server would have refused to save.
    const operators = CLOSED_STRING_VALUES[condition.field] ? ENTITY_OPERATORS : TEXT_OPERATORS;
    const validStrings = STRING_FIELDS.includes(condition.field) && operators.includes(condition.operator) && condition.values.length > 0 && condition.values.every(value => typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_STRING_VALUE_LENGTH);
    if (!validStrings) return false;

    // Closed sets are checked here as well as on the server. A value outside the set could
    // only come from a tampered payload, and an unknown one must not ride along into an
    // `is not` and quietly widen who the popup reaches.
    const allowed = CLOSED_STRING_VALUES[condition.field];
    return !allowed || condition.values.every(value => allowed.includes(value));
  }

  /**
   * A measurement that has not been reported yet fails every comparison, including the
   * ones that point downwards: "pages viewed is at most 2" must not hold before the
   * runtime has counted a single page.
   */
  thresholdMatches(condition, actual) {
    if (actual === undefined || actual === null || actual === '') return false;
    const value = Number(actual);
    const expected = Number(condition.values[0]);
    switch (condition.operator) {
      case 'at_least':
        return value >= expected;
      case 'at_most':
        return value <= expected;
      case 'greater_than':
        return value > expected;
      case 'less_than':
        return value < expected;
      default:
        return false;
    }
  }

  /**
   * A missing value satisfies a negative operator and fails a positive one. Treating it as
   * an empty string would make "title contains x" and "title does not contain x" agree,
   * which breaks the exact complement the rules promise.
   */
  stringMatches(condition, actual) {
    const negative = NEGATIVE_OPERATORS.includes(condition.operator);
    if (actual === undefined || actual === null) return negative;
    const value = String(actual).toLowerCase();
    const hit = condition.values.some(expected => this.compare(condition.operator, value, String(expected).toLowerCase()));
    return negative ? !hit : hit;
  }

  /**
   * Page URL compares canonical paths on both sides, so a value saved as `/sale` still
   * matches a visitor on `/sale/`, `/SALE` or `/#/sale`, and one pasted with its domain
   * still names the page. A value that reduces to nothing would match every page: the
   * server refuses to save one, and a payload carrying it anyway fails closed instead of
   * reaching everyone.
   */
  pathMatches(condition, actual, context) {
    const negative = NEGATIVE_OPERATORS.includes(condition.operator);
    if (actual === undefined || actual === null) return negative;
    const mode = _page_path.PagePath.modeFor(condition.operator);
    const expected = condition.values.map(value => _page_path.PagePath.canonical(value, {
      mode
    }));
    if (expected.includes('')) return false;
    const path = _page_path.PagePath.canonical(actual);
    const hit = expected.some(value => mode === _page_path.PagePath.CONTAINS ? path.includes(value) : path === value);
    return negative ? !hit : hit;
  }
  compare(operator, actual, expected) {
    switch (operator) {
      case 'contains':
      case 'does_not_contain':
        return actual.includes(expected);
      case 'is':
      case 'is_not':
        return actual === expected;
      case 'starts_with':
        return actual.startsWith(expected);
      case 'ends_with':
        return actual.endsWith(expected);
      default:
        return false;
    }
  }
}
exports.PopupDisplayRules = PopupDisplayRules;
var _default = PopupDisplayRules;
exports.default = _default;