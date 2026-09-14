"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.User = void 0;
var _cookies = require("./cookies");
class User {
  static get id() {
    return _cookies.Cookies.get('hello_user_id');
  }
  static get source() {
    return _cookies.Cookies.get('hello_user_source');
  }
  static get fingerprint() {
    return _cookies.Cookies.get('hello_user_identification_hash');
  }
  static remember(id, source, fingerprint) {
    if (source) {
      _cookies.Cookies.set('hello_user_source', source);
    }
    if (fingerprint) {
      _cookies.Cookies.set('hello_user_identification_hash', fingerprint);
    }
    _cookies.Cookies.set('hello_user_id', id);
  }
  static forget() {
    _cookies.Cookies.delete('hello_user_id');
    _cookies.Cookies.delete('hello_user_source');
    _cookies.Cookies.delete('hello_user_identification_hash');
  }
  static get identificationData() {
    if (!this.id) return {};
    return {
      id: this.id,
      source: this.source
    };
  }
}
exports.User = User;