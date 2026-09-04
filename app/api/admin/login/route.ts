import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import { ADMIN_SESSION_COOKIE, createAdminSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = body.email?.trim().toLowerCase()

    if (!email || !body.password) {
      return NextResponse.json({ error: "Email y contraseña son obligatorios" }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()
    const { data: admin, error } = await supabase
      .from("admin_users")
      .select("email, password_hash, is_active, role")
      .eq("email", email)
      .eq("is_active", true)
      .eq("role", "admin")
      .maybeSingle()

    if (error || !admin || !(await bcrypt.compare(body.password, admin.password_hash))) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const token = await createAdminSession(admin.email)
    const response = NextResponse.json({ data: { email: admin.email } }, { status: 200 })

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    })

    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar sesión"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
