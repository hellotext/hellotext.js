import { Configuration, Locale } from '../core';
import Hellotext from '../hellotext';
class WhatsAppWidgetsAPI {
  static get endpoint() {
    return Configuration.endpoint('public/widgets/whatsapp');
  }
  static async get(id) {
    const url = new URL(`${this.endpoint}/${id}`);
    url.searchParams.append('locale', Locale.toString());
    url.searchParams.append('placement', Configuration.whatsapp.placement);
    this.appendWhatsAppOverrides(url);
    const response = await this.fetchWidget(url);
    if (!response.ok) return null;
    const data = await this.parseWidgetResponse(response);
    if (!data) return null;
    if (!Hellotext.business.data) {
      Hellotext.business.setData(data.business);
      Hellotext.business.setLocale(data.locale);
    }
    return new DOMParser().parseFromString(data.html, 'text/html').querySelector('article');
  }
  static appendWhatsAppOverrides(url) {
    const {
      appearance,
      body,
      number
    } = Configuration.whatsapp;
    this.appendIfSupplied(url, 'whatsapp[appearance][launcher][icon_url]', appearance.launcher?.iconUrl);
    this.appendIfSupplied(url, 'whatsapp[number]', number);
    this.appendIfSupplied(url, 'whatsapp[body]', body);
  }
  static appendIfSupplied(url, key, value) {
    if (value === undefined || value === null) return;
    url.searchParams.append(key, String(value));
  }
  static async fetchWidget(url) {
    try {
      return await fetch(url, {
        method: 'GET',
        headers: Hellotext.headers
      });
    } catch (_) {
      return {
        ok: false
      };
    }
  }
  static async parseWidgetResponse(response) {
    try {
      return await response.json();
    } catch (_) {
      return null;
    }
  }
}
export default WhatsAppWidgetsAPI;