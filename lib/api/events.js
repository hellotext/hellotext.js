import { Configuration } from '../core';
import { Query } from '../models';
import { Response } from './response';
export default class EventsAPI {
  static get endpoint() {
    return Configuration.endpoint('track/events');
  }
  static async create({
    headers,
    body,
    keepalive = false
  }) {
    if (Query.inPreviewMode) {
      return new Response(true, {
        received: true
      });
    }
    const fetchOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    };

    // Do not send `keepalive: false`. The track caller opts in only for payloads
    // that fit the browser keepalive budget; omitting the key for larger events
    // preserves normal fetch behavior for rich carts/orders instead of asking
    // the browser to use an unload-safe transport it may reject.
    if (keepalive) {
      fetchOptions.keepalive = true;
    }
    const response = await fetch(this.endpoint, fetchOptions);
    return new Response(response.status === 200, await response.json());
  }
}