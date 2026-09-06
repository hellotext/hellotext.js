"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
var _models = require("../models");
var _response = require("./response");
class EventsAPI {
  static get endpoint() {
    return _core.Configuration.endpoint('track/events');
  }
  static async create({
    headers,
    body,
    keepalive = false
  }) {
    if (_models.Query.inPreviewMode) {
      return new _response.Response(true, {
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
    return new _response.Response(response.status === 200, await response.json());
  }
}
exports.default = EventsAPI;