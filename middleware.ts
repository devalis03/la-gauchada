import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/admin-auth"

/**
 * Protects every /admin route on the server. The login page and the auth API
 * routes are excluded via the matcher below. Unauthenticated requests are
 * redirected to /admin/login.
 */
export async function middleware(request: NextRequest) {
  const secret = process.env.AUTH_SECRET || ""
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  const isValid = await verifySessionToken(token, secret)

  if (!isValid) {
    const loginUrl = new URL("/admin/login", request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Protect /admin and its sub-routes, but not the login page.
  matcher: ["/admin", "/admin/((?!login).*)"],
}
