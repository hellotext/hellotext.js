"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
class Query {
  constructor(urlQueries) {
    this.urlSearchParams = new URLSearchParams(urlQueries);
  }
  get(param) {
    return this.urlSearchParams.get(this.toHellotextParam(param));
  }
  has(param) {
    return this.urlSearchParams.has(this.toHellotextParam(param));
  }
  toHellotextParam(param) {
    return "hello_".concat(param);
  }
}
exports.default = Query;