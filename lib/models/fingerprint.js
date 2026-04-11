function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function normalizeValue(value) {
  // Collapse "missing" values so callers can add optional fields incrementally
  // without changing the fingerprint when the effective payload is the same.
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    var trimmedValue = value.trim();

    // Treat blank strings as absent values so "" and an omitted field compare equally.
    return trimmedValue === '' ? undefined : trimmedValue;
  }
  if (Array.isArray(value)) {
    // Preserve array order because, unlike object keys, caller-provided sequence can be meaningful.
    return value.map(item => normalizeValue(item)).filter(item => item !== undefined);
  }
  if (value instanceof Date) {
    // Serialize dates into a stable primitive so equivalent timestamps fingerprint the same way.
    return value.toISOString();
  }
  if (typeof value === 'object') {
    // Canonicalize object shape by sorting keys recursively, so key placement never affects equality.
    var normalizedObject = Object.keys(value).sort((leftKey, rightKey) => leftKey.localeCompare(rightKey)).reduce((result, key) => {
      var normalizedChild = normalizeValue(value[key]);
      if (normalizedChild !== undefined) {
        result[key] = normalizedChild;
      }
      return result;
    }, {});
    return Object.keys(normalizedObject).length > 0 ? normalizedObject : undefined;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return undefined;
}
function serializePayload(session, userId) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var normalizedPayload = normalizeValue(_objectSpread({
    session,
    user_id: userId
  }, options)) || {};
  return JSON.stringify(normalizedPayload);
}
function fallbackHash(value) {
  var hash = 5381;
  for (var index = 0; index < value.length; index += 1) {
    hash = hash * 33 ^ value.charCodeAt(index);
  }
  return "v1:".concat((hash >>> 0).toString(16));
}
function sha256(_x) {
  return _sha.apply(this, arguments);
}
function _sha() {
  _sha = _asyncToGenerator(function* (value) {
    var _globalThis$crypto;
    if (!((_globalThis$crypto = globalThis.crypto) !== null && _globalThis$crypto !== void 0 && _globalThis$crypto.subtle) || typeof TextEncoder === 'undefined') {
      return fallbackHash(value);
    }
    var digest = yield globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    var hex = Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
    return "v1:".concat(hex);
  });
  return _sha.apply(this, arguments);
}
var Fingerprint = /*#__PURE__*/function () {
  function Fingerprint() {
    _classCallCheck(this, Fingerprint);
  }
  _createClass(Fingerprint, null, [{
    key: "matches",
    value: function matches(storedFingerprint, fingerprint) {
      return !!storedFingerprint && storedFingerprint === fingerprint;
    }
  }, {
    key: "generate",
    value: function () {
      var _generate = _asyncToGenerator(function* (session, userId) {
        var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        return yield sha256(serializePayload(session, userId, options));
      });
      function generate(_x2, _x3) {
        return _generate.apply(this, arguments);
      }
      return generate;
    }()
  }]);
  return Fingerprint;
}();
export { Fingerprint };