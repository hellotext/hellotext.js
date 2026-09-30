import { Cookies } from './cookies';
class UTM {
  constructor() {
    this.save(UTM.paramsFrom(window.location.search));
  }

  /**
   * The campaign parameters a query string carries, keyed the way attribution stores them.
   * Parameters that are absent or blank are left out rather than kept as empty values.
   *
   * @param {String} search - a query string such as `window.location.search`
   * @returns {Object}
   */
  static paramsFrom(search) {
    const params = new URLSearchParams(search);
    return Object.fromEntries(Object.entries({
      source: params.get('utm_source'),
      medium: params.get('utm_medium'),
      campaign: params.get('utm_campaign'),
      term: params.get('utm_term'),
      content: params.get('utm_content')
    }).filter(([_, value]) => value));
  }
  save(utmParams) {
    if (!utmParams.source || !utmParams.medium) return;
    const cleanUtms = Object.fromEntries(Object.entries(utmParams).filter(([_, value]) => value));
    cleanUtms.observed_at = new Date().toISOString();
    Cookies.set('hello_utm', JSON.stringify(cleanUtms));
  }
  get current() {
    try {
      return JSON.parse(Cookies.get('hello_utm')) || {};
    } catch (e) {
      return {};
    }
  }
}
export { UTM };