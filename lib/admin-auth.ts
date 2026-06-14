/**
 * Edge-compatible admin authentication helpers.
 *
 * Uses the Web Crypto API (available in both the Edge runtime / middleware and
 * Node) so the same code verifies sessions everywhere.
 *
 * Required env vars:
 *  - ADMIN_PASSWORD_HASH -> SHA-256 hex digest of the admin password
 *  - AUTH_SECRET         -> long random string used to sign the session cookie
 */

export const ADMIN_COOKIE = "admin_session"
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8 // 8 hours

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

function base64url(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64url(input: string): string {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/")
  return atob(padded)
}

/** SHA-256 hex digest — used to compare a submitted password to ADMIN_PASSWORD_HASH. */
export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return toHex(digest)
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message))
  return toHex(signature)
}

/** Creates a signed session token of the form `<payloadB64>.<signature>`. */
export async function createSessionToken(secret: string): Promise<string> {
  const payload = base64url(JSON.stringify({ exp: Date.now() + SESSION_DURATION_MS }))
  const sig = await hmac(secret, payload)
  return `${payload}.${sig}`
}

/** Verifies the signature and expiry of a session token. */
export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token || !secret) return false
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return false

  const expected = await hmac(secret, payload)
  // Constant-time-ish comparison (lengths are fixed hex strings).
  if (expected.length !== sig.length) return false
  let mismatch = 0
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  if (mismatch !== 0) return false

  try {
    const { exp } = JSON.parse(fromBase64url(payload)) as { exp: number }
    return typeof exp === "number" && exp > Date.now()
  } catch {
    return false
  }
}
