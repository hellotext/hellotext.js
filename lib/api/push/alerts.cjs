"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hellotext = _interopRequireDefault(require("../../hellotext"));
var _core = require("../../core");
var _response = require("../response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/**
 * Records Smart Alert interactions for the current business and session.
 */
class PushAlertsAPI {
  static get endpoint() {
    return _core.Configuration.endpoint('public/push/alerts');
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
      headers: _hellotext.default.headers,
      body: JSON.stringify({
        session: _hellotext.default.session,
        section,
        kind,
        page
      })
    });
    return new _response.Response(response.ok, response);
  }
}
var _default = PushAlertsAPI;
exports.default = _default;