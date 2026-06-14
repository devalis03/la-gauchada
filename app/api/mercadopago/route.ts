import { NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { z } from "zod"

// Order payload sent from the checkout client. We only trust it to build the
// preference; amounts are recomputed from the items server-side.
const bodySchema = z.object({
  origin: z.string().url(),
  order: z.object({
    id: z.string().min(1),
    shipping: z.number().nonnegative(),
    customer: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().optional().default(""),
      phone: z.string().optional().default(""),
    }),
    items: z
      .array(
        z.object({
          quantity: z.number().int().positive(),
          product: z.object({
            id: z.string(),
            name: z.string(),
            price: z.number().nonnegative(),
          }),
        }),
      )
      .min(1),
  }),
})

export async function POST(request: Request) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json(
      { error: "MERCADO_PAGO_ACCESS_TOKEN no está configurado en el servidor." },
      { status: 500 },
    )
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos del pedido inválidos" }, { status: 400 })
  }

  const { order, origin } = parsed.data
  // Prefer a public site URL (needed for webhooks in production); fall back to origin.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin

  const items = order.items.map((item) => ({
    id: item.product.id,
    title: item.product.name,
    quantity: item.quantity,
    unit_price: Number(item.product.price),
    currency_id: "ARS",
  }))

  // Shipping is added as a line item so the MP total matches the cart total.
  if (order.shipping > 0) {
    items.push({
      id: "shipping",
      title: "Costo de envío",
      quantity: 1,
      unit_price: Number(order.shipping),
      currency_id: "ARS",
    })
  }

  try {
    const client = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(client)

    const result = await preference.create({
      body: {
        items,
        payer: {
          name: order.customer.firstName,
          surname: order.customer.lastName,
          email: order.customer.email || undefined,
          phone: order.customer.phone
            ? { number: order.customer.phone }
            : undefined,
        },
        back_urls: {
          success: `${baseUrl}/checkout/success?orderId=${order.id}`,
          pending: `${baseUrl}/checkout/success?orderId=${order.id}&payment=pending`,
          failure: `${baseUrl}/checkout?payment=failure`,
        },
        auto_return: "approved",
        external_reference: order.id,
        notification_url: `${baseUrl}/api/mercadopago/webhook`,
        statement_descriptor: "LA GAUCHADA",
      },
    })

    if (!result.init_point) {
      return NextResponse.json(
        { error: "Mercado Pago no devolvió una URL de pago." },
        { status: 502 },
      )
    }

    return NextResponse.json({
      init_point: result.init_point,
      preferenceId: result.id,
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al crear la preferencia de pago."
    console.error("[mercadopago] preference error:", message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
