'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = void 0
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
var _success = /*#__PURE__*/ _classPrivateFieldLooseKey('success')
var _response = /*#__PURE__*/ _classPrivateFieldLooseKey('response')
var Response = /*#__PURE__*/ (function () {
  function Response(success, response) {
    _classCallCheck(this, Response)
    Object.defineProperty(this, _success, {
      writable: true,
      value: void 0,
    })
    Object.defineProperty(this, _response, {
      writable: true,
      value: void 0,
    })
    _classPrivateFieldLooseBase(this, _success)[_success] = success
    _classPrivateFieldLooseBase(this, _response)[_response] = response
  }
  _createClass(Response, [
    {
      key: 'data',
      get: function get() {
        return _classPrivateFieldLooseBase(this, _response)[_response]
      },
    },
    {
      key: 'failed',
      get: function get() {
        return _classPrivateFieldLooseBase(this, _success)[_success] === false
      },
    },
    {
      key: 'succeeded',
      get: function get() {
        return _classPrivateFieldLooseBase(this, _success)[_success] === true
      },
    },
  ])
  return Response
})()
exports.default = Response
