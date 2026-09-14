import Hellotext from '../../hellotext';
import { Configuration } from '../../core';
import { Response } from '../response';
class PushIdentitiesAPI {
  static get endpoint() {
    return Configuration.endpoint('public/push/identities');
  }
  static async create(data = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      keepalive: true,
      headers: Hellotext.headers,
      body: JSON.stringify({
        ...data,
        session: Hellotext.session,
        origin: window.location.origin
      })
    });
    return new Response(response.ok, response);
  }
  static async destroy(data = {}) {
    const response = await fetch(this.endpoint, {
      method: 'DELETE',
      keepalive: true,
      headers: Hellotext.headers,
      body: JSON.stringify({
        ...data,
        session: Hellotext.session,
        origin: window.location.origin
      })
    });
    return new Response(response.ok, response);
  }
}
export default PushIdentitiesAPI;