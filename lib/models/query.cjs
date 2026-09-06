"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Query = void 0;
class Query {
  static get inPreviewMode() {
    return new this().inPreviewMode;
  }
  constructor() {
    this.urlSearchParams = new URLSearchParams(window.location.search);
  }
  get(param) {
    return this.urlSearchParams.get(this.toHellotextParam(param));
  }
  has(param) {
    return this.urlSearchParams.has(this.toHellotextParam(param));
  }
  get inPreviewMode() {
    return this.has('preview');
  }
  get session() {
    return this.get('session');
  }
  toHellotextParam(param) {
    return `hello_${param}`;
  }
}
exports.Query = Query;