'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.OTPBuilder = void 0
var _hellotext = _interopRequireDefault(require('../hellotext'))
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function')
  }
}
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i]
    descriptor.enumerable = descriptor.enumerable || false
    descriptor.configurable = true
    if ('value' in descriptor) descriptor.writable = true
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor)
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps)
  if (staticProps) _defineProperties(Constructor, staticProps)
  Object.defineProperty(Constructor, 'prototype', { writable: false })
  return Constructor
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, 'string')
  return typeof key === 'symbol' ? key : String(key)
}
function _toPrimitive(input, hint) {
  if (typeof input !== 'object' || input === null) return input
  var prim = input[Symbol.toPrimitive]
  if (prim !== undefined) {
    var res = prim.call(input, hint || 'default')
    if (typeof res !== 'object') return res
    throw new TypeError('@@toPrimitive must return a primitive value.')
  }
  return (hint === 'string' ? String : Number)(input)
}
function _classPrivateFieldLooseBase(receiver, privateKey) {
  if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
    throw new TypeError('attempted to use private field on non-instance')
  }
  return receiver
}
var id = 0
function _classPrivateFieldLooseKey(name) {
  return '__private_' + id++ + '_' + name
}
var _template = /*#__PURE__*/ _classPrivateFieldLooseKey('template')
var OTPBuilder = /*#__PURE__*/ (function () {
  function OTPBuilder() {
    _classCallCheck(this, OTPBuilder)
  }
  _createClass(OTPBuilder, null, [
    {
      key: 'build',
      value: function build(submissionId, label) {
        var element = _classPrivateFieldLooseBase(this, _template)[_template](submissionId, label)
        var container = document.createElement('div')
        container.innerHTML = element
        return container
      },
    },
  ])
  return OTPBuilder
})()
exports.OTPBuilder = OTPBuilder
function _template2(submissionId, label) {
  return '\n      <article \n        data-controller="hellotext--otp" \n        data-hellotext--otp-submission-id-value="'
    .concat(
      submissionId,
      '"\n        data-hellotext--form-target="otpContainer"\n        data-form-otp\n        >\n        <header data-otp-header>\n          <p>',
    )
    .concat(
      label,
      '</p>\n          <input \n            type="text"\n            name="otp"\n            data-hellotext--otp-target="input"\n            placeholder="Enter your OTP"\n            maxlength="6"\n            />\n        </header>\n        \n        <footer data-otp-footer>\n          <button type="button" data-hellotext--otp-target="resendButton" data-action="hellotext--otp#resend">\n            ',
    )
    .concat(
      _hellotext.default.business.locale.otp.resend,
      '\n          </button>\n        </footer>\n      </article>\n    ',
    )
}
Object.defineProperty(OTPBuilder, _template, {
  value: _template2,
})
