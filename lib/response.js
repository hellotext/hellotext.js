"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }
var id = 0;
function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }
var _success = /*#__PURE__*/_classPrivateFieldLooseKey("success");
var _response = /*#__PURE__*/_classPrivateFieldLooseKey("response");
class Response {
  constructor(success, response) {
    Object.defineProperty(this, _success, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _response, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldLooseBase(this, _success)[_success] = success;
    _classPrivateFieldLooseBase(this, _response)[_response] = response;
  }
  get data() {
    return _classPrivateFieldLooseBase(this, _response)[_response];
  }
  get failed() {
    return _classPrivateFieldLooseBase(this, _success)[_success] === false;
  }
  get succeeded() {
    return _classPrivateFieldLooseBase(this, _success)[_success] === true;
  }
}
exports.default = Response;