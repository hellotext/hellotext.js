"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _core = require("../core");
class _default {
  static get endpoint() {
    return _core.Configuration.endpoint('public/businesses');
  }
  static async get(id) {
    return fetch(`${this.endpoint}/${id}`, {
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