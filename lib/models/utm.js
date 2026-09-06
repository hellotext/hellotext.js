import { Cookies } from './cookies';
class UTM {
  constructor() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const utmsFromUrl = {
      source: urlSearchParams.get('utm_source'),
      medium: urlSearchParams.get('utm_medium'),
      campaign: urlSearchParams.get('utm_campaign'),
      term: urlSearchParams.get('utm_term'),
      content: urlSearchParams.get('utm_content')
    };
    this.save(utmsFromUrl);
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