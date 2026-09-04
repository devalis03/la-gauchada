import { jwtVerify, SignJWT } from "jose"

export const ADMIN_SESSION_COOKIE = "la-gauchada-admin-session"

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error("Missing SESSION_SECRET")
  }

  return new TextEncoder().encode(secret)
}

export async function createAdminSession(email: string) {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSessionSecret())
}

export async function verifyAdminSession(token: string) {
  const { payload } = await jwtVerify(token, getSessionSecret())

  if (payload.role !== "admin" || typeof payload.email !== "string") {
    throw new Error("Invalid admin session")
  }

  return { email: payload.email }
}
