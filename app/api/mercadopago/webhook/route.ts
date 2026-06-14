import { NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { sendPaymentStatusNotification } from "@/lib/email-service"

/**
 * Mercado Pago webhook (notification_url).
 *
 * MP sends a notification whenever a payment changes state. We fetch the
 * payment with our access token (which also authenticates the event) and email
 * the business the resulting status. Because this project has no database yet,
 * the order lives in the customer's browser (localStorage); this endpoint is
 * the place to plug in a real DB update once persistence is added.
 *
 * Always responds 200 quickly so MP does not retry indefinitely.
 */
export async function POST(request: Request) {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
  if (!accessToken) {
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  try {
    const url = new URL(request.url)
    let paymentId =
      url.searchParams.get("data.id") || url.searchParams.get("id") || undefined
    const queryType = url.searchParams.get("type") || url.searchParams.get("topic")

    // Body may also carry the data depending on the notification format.
    let bodyType = queryType
    try {
      const body = await request.json()
      if (body?.data?.id) paymentId = String(body.data.id)
      if (body?.type) bodyType = body.type
    } catch {
      // No JSON body (query-string style notification) — that's fine.
    }

    // Only act on payment notifications.
    if (bodyType && bodyType !== "payment") {
      return NextResponse.json({ ok: true }, { status: 200 })
    }
    if (!paymentId) {
      return NextResponse.json({ ok: true }, { status: 200 })
    }

    const client = new MercadoPagoConfig({ accessToken })
    const payment = await new Payment(client).get({ id: paymentId })

    const orderId = payment.external_reference || "(sin referencia)"
    const status = payment.status || "unknown"

    // TODO (persistence): when a DB is added, look up `orderId` and update its
    // status here (e.g. approved -> "confirmed", rejected -> cancel & restock).
    await sendPaymentStatusNotification({
      orderId,
      status,
      amount: payment.transaction_amount ?? undefined,
      payerEmail: payment.payer?.email ?? undefined,
    })

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "webhook error"
    console.error("[mercadopago] webhook error:", message)
    // Still return 200 to avoid aggressive retries on transient issues.
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}

// MP may probe the endpoint with GET during configuration.
export async function GET() {
  return NextResponse.json({ ok: true })
}
