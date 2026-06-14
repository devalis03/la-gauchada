import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ADMIN_COOKIE, createSessionToken, sha256Hex } from "@/lib/admin-auth"

export async function POST(request: Request) {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  const secret = process.env.AUTH_SECRET

  if (!passwordHash || !secret) {
    return NextResponse.json(
      { ok: false, error: "El acceso de administrador no está configurado en el servidor." },
      { status: 500 },
    )
  }

  let password = ""
  try {
    const body = await request.json()
    password = typeof body?.password === "string" ? body.password : ""
  } catch {
    return NextResponse.json({ ok: false, error: "Solicitud inválida" }, { status: 400 })
  }

  const submittedHash = await sha256Hex(password)
  if (submittedHash !== passwordHash.toLowerCase()) {
    return NextResponse.json({ ok: false, error: "Contraseña incorrecta" }, { status: 401 })
  }

  const token = await createSessionToken(secret)
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  })

  return NextResponse.json({ ok: true })
}
