import Hellotext from '../../hellotext';
import { Configuration } from '../../core';
import { Response } from '../response';

/**
 * Records Smart Alert interactions for the current business and session.
 */
class PushAlertsAPI {
  static get endpoint() {
    return Configuration.endpoint('public/push/alerts');
  }

  /**
   * Posts an interaction without parsing the endpoint's empty success response.
   *
   * @param {Object} data - Alert interaction.
   * @param {import('../../../index').HellotextAlertSection} data.section - Displayed section.
   * @param {'shown'|'dismissed'|'accepted'} data.kind - Interaction to record.
   * @param {{url: string, title: string, path: string}} data.page - Page snapshot from display.
   * @returns {Promise<Response>} Whether the server accepted the interaction.
   */
  static async create({
    section,
    kind,
    page
  }) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      keepalive: true,
      headers: Hellotext.headers,
      body: JSON.stringify({
        session: Hellotext.session,
        section,
        kind,
        page
      })
    });
    return new Response(response.ok, response);
  }
}
export default PushAlertsAPI;