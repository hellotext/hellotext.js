"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hellotext = _interopRequireDefault(require("../hellotext"));
var _core = require("../core");
var _response = require("./response");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
class SubmissionsAPI {
  static get endpoint() {
    return _core.Configuration.endpoint('public/submissions');
  }
  static async resendOTP(id) {
    const response = await fetch(`${this.endpoint}/${id}/otps`, {
      method: 'POST',
      headers: _hellotext.default.headers
    });
    return new _response.Response(response.ok, response);
  }
  static async verifyOTP(id, otp) {
    const response = await fetch(`${this.endpoint}/${id}/otps/${otp}/verify`, {
      method: 'POST',
      headers: _hellotext.default.headers
    });
    return new _response.Response(response.ok, response);
  }
}
var _default = SubmissionsAPI;
exports.default = _default;