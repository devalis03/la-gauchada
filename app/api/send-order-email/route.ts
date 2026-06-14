import { NextResponse } from "next/server"
import { z } from "zod"
import { sendOrderNotification } from "@/lib/email-service"
import type { Order } from "@/lib/types"

// Lightweight validation of the order payload coming from the checkout client.
const orderSchema = z.object({
  id: z.string().min(1),
  subtotal: z.number(),
  shipping: z.number(),
  total: z.number(),
  createdAt: z.string(),
  paymentMethod: z.enum(["efectivo", "tarjeta", "transferencia"]),
  customer: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    dni: z.string().optional().default(""),
    address: z.string().optional().default(""),
    city: z.string().optional().default(""),
    postalCode: z.string().optional().default(""),
    notes: z.string().optional(),
  }),
  items: z
    .array(
      z.object({
        quantity: z.number(),
        product: z.object({
          name: z.string(),
          price: z.number(),
        }),
      }),
    )
    .min(1),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 })
  }

  const parsed = orderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Datos del pedido incompletos" },
      { status: 400 },
    )
  }

  const result = await sendOrderNotification(parsed.data as unknown as Order, "nuevo")

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
