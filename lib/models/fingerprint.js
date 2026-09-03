function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
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
  return _createClass(Fingerprint, null, [{
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
}();
export { Fingerprint };