function normalizeValue(value) {
  // Collapse "missing" values so callers can add optional fields incrementally
  // without changing the fingerprint when the effective payload is the same.
  if (value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim()

    // Treat blank strings as absent values so "" and an omitted field compare equally.
    return trimmedValue === '' ? undefined : trimmedValue
  }

  if (Array.isArray(value)) {
    // Preserve array order because, unlike object keys, caller-provided sequence can be meaningful.
    return value
      .map(item => normalizeValue(item))
      .filter(item => item !== undefined)
  }

  if (value instanceof Date) {
    // Serialize dates into a stable primitive so equivalent timestamps fingerprint the same way.
    return value.toISOString()
  }

  if (typeof value === 'object') {
    // Canonicalize object shape by sorting keys recursively, so key placement never affects equality.
    const normalizedObject = Object.keys(value)
      .sort((leftKey, rightKey) => leftKey.localeCompare(rightKey))
      .reduce((result, key) => {
        const normalizedChild = normalizeValue(value[key])

        if (normalizedChild !== undefined) {
          result[key] = normalizedChild
        }

        return result
      }, {})

    return Object.keys(normalizedObject).length > 0 ? normalizedObject : undefined
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  return undefined
}

function serializePayload(session, userId, options = {}) {
  const normalizedPayload = normalizeValue({
    session,
    user_id: userId,
    ...options,
  }) || {}

  return JSON.stringify(normalizedPayload)
}

function fallbackHash(value) {
  let hash = 5381

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index)
  }

  return `v1:${(hash >>> 0).toString(16)}`
}

async function sha256(value) {
  if (!globalThis.crypto?.subtle || typeof TextEncoder === 'undefined') {
    return fallbackHash(value)
  }

  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  )

  const hex = Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')

  return `v1:${hex}`
}

class Fingerprint {
  static matches(storedFingerprint, fingerprint) {
    return !!storedFingerprint && storedFingerprint === fingerprint
  }

  static async generate(session, userId, options = {}) {
    return await sha256(serializePayload(session, userId, options))
  }
}

export { Fingerprint }
