"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Fingerprint = void 0;
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function normalizeValue(value) {
  // Collapse "missing" values so callers can add optional fields incrementally
  // without changing the fingerprint when the effective payload is the same.
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    const trimmedValue = value.trim();

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
    const normalizedObject = Object.keys(value).sort((leftKey, rightKey) => leftKey.localeCompare(rightKey)).reduce((result, key) => {
      const normalizedChild = normalizeValue(value[key]);
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
function serializePayload(session, userId, options = {}) {
  const normalizedPayload = normalizeValue({
    session,
    user_id: userId,
    ...options
  }) || {};
  return JSON.stringify(normalizedPayload);
}
function fallbackHash(value) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = hash * 33 ^ value.charCodeAt(index);
  }
  return `v1:${(hash >>> 0).toString(16)}`;
}
async function sha256(value) {
  var _globalThis$crypto;
  if (!((_globalThis$crypto = globalThis.crypto) !== null && _globalThis$crypto !== void 0 && _globalThis$crypto.subtle) || typeof TextEncoder === 'undefined') {
    return fallbackHash(value);
  }
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  const hex = Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `v1:${hex}`;
}
let Fingerprint = /*#__PURE__*/function () {
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
    value: async function generate(session, userId, options = {}) {
      return await sha256(serializePayload(session, userId, options));
    }
  }]);
  return Fingerprint;
}();
exports.Fingerprint = Fingerprint;