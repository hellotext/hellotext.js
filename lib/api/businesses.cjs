"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
class _default {
  static endpoint(apiRoot = _core.Configuration.apiRoot) {
    return `${apiRoot}/public/businesses`;
  }
  static async get(id, apiRoot) {
    return fetch(`${this.endpoint(apiRoot)}/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${id}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }
}
exports.default = _default;