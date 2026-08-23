import bcrypt from "bcryptjs"

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
]

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Falta la variable ${name}`)
  }
}

const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)
const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/admin_users`, {
  method: "POST",
  headers: {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify({
    email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
    password_hash: passwordHash,
    role: "admin",
    is_active: true,
  }),
})

if (!response.ok) {
  throw new Error(`Supabase respondió ${response.status}: ${await response.text()}`)
}

console.log("Administrador creado o actualizado correctamente.")
