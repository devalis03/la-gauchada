import { NextRequest, NextResponse } from "next/server"
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/auth/session"

function isProtectedAdminRequest(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    return true
  }

  if (pathname === "/api/orders" && request.method === "GET") {
    return true
  }

  if (pathname === "/api/orders/stats") {
    return true
  }

  if (/^\/api\/products\/[^/]+\/stock$/.test(pathname)) {
    return true
  }

  if (/^\/api\/orders\/[^/]+\/status$/.test(pathname)) {
    return true
  }

  return false
}

export async function middleware(request: NextRequest) {
  if (!isProtectedAdminRequest(request)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) {
    return request.nextUrl.pathname.startsWith("/admin")
      ? NextResponse.redirect(new URL("/admin/login", request.url))
      : NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  try {
    await verifyAdminSession(token)
    return NextResponse.next()
  } catch {
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const response = NextResponse.redirect(new URL("/admin/login", request.url))
      response.cookies.delete(ADMIN_SESSION_COOKIE)
      return response
    }

    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 })
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/orders",
    "/api/orders/:path*",
    "/api/products/:path*",
  ],
}
