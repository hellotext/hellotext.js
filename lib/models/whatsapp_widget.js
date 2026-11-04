import { Configuration } from '../core';
import API from '../api';
import { Business } from './business';
import { Session } from './session';
const CLICK_URL_ATTRIBUTE = 'data-hellotext--whatsapp-widget-click-url-value';
class WhatsAppWidget {
  static async load(id) {
    const widget = new WhatsAppWidget({
      id,
      html: await API.whatsappWidgets.get(id)
    });
    widget.rendered = widget.render();
    return widget;
  }
  constructor(data) {
    this.data = data;
    this.mounted = false;
    this.rendered = Promise.resolve(false);
  }
  async render() {
    if (!this.data.html) return false;
    const container = this.containerToAppendTo;
    if (!container) {
      console.warn(`Hellotext WhatsApp widget was not mounted because the container ${Configuration.whatsapp.container} was not found.`);
      return false;
    }
    if (!(await this.stylesheetLoaded)) {
      console.warn('Hellotext WhatsApp widget was not mounted because its stylesheet failed to load.');
      return false;
    }
    this.linkThroughClickEndpoint();
    container.appendChild(this.data.html);
    this.markCoexistingWidgets();
    this.mounted = true;
    return true;
  }

  // The widget's links lead to WhatsApp through Hellotext's click endpoint,
  // which records the click and adds the session's reference to the message.
  // The server caches one widget for every visitor, so the links it renders
  // can't carry the session. Each link is rebuilt here from the endpoint's URL,
  // with the number and message the widget rendered, overrides included, and
  // the session. Without a session the links stay as rendered: they still
  // reach WhatsApp, with nothing recorded.
  linkThroughClickEndpoint() {
    const clickUrl = this.data.html.getAttribute(CLICK_URL_ATTRIBUTE);
    const session = Session.session;
    if (!clickUrl || !session) return;
    this.data.html.querySelectorAll('a[href]').forEach(link => {
      const href = this.clickHref(clickUrl, link.getAttribute('href'), session);
      if (href) link.setAttribute('href', href);
    });
  }

  // Null for a link that doesn't lead to the click endpoint.
  clickHref(clickUrl, href, session) {
    try {
      const endpoint = new URL(clickUrl);
      const rendered = new URL(href, endpoint);
      if (rendered.origin !== endpoint.origin || rendered.pathname !== endpoint.pathname) return null;
      ['number', 'text'].forEach(key => {
        const value = rendered.searchParams.get(key);
        if (value) endpoint.searchParams.set(key, value);
      });
      endpoint.searchParams.set('session', session);
      return endpoint.toString();
    } catch (_) {
      return null;
    }
  }
  get containerToAppendTo() {
    try {
      return document.querySelector(Configuration.whatsapp.container);
    } catch (_) {
      return null;
    }
  }
  get stylesheetLoaded() {
    return Business.waitForStylesheet(Business.latestStylesheet);
  }
  markCoexistingWidgets() {
    const webchat = document.querySelector('.hellotext--webchat:not(.hellotext--whatsapp-widget)');
    const whatsapp = this.data.html;
    if (!webchat || !whatsapp) return;
    webchat.classList.add('hellotext--with-whatsapp-widget');
    whatsapp.classList.add('hellotext--with-webchat');
  }
}
export { WhatsAppWidget };