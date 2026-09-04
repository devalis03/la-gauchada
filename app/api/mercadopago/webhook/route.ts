import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import {
  findOrderByExternalReference,
  registerPaymentNotification,
  restoreOrderStockIfNeeded,
  setOrderPayment,
} from "@/lib/repositories/orders-repo"

function getMpClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error("Missing MERCADOPAGO_ACCESS_TOKEN")
  }

  return new MercadoPagoConfig({ accessToken })
}

function getPaymentId(request: NextRequest, body: unknown): string | null {
  const payload = body as { data?: { id?: string | number }; id?: string | number }
  const queryId = request.nextUrl.searchParams.get("data.id")
  const bodyId = payload?.data?.id ?? payload?.id
  const paymentId = queryId ?? bodyId

  return paymentId ? String(paymentId) : null
}

function mapPaymentStatus(status: string | undefined) {
  switch (status) {
    case "approved":
      return "approved" as const
    case "rejected":
      return "rejected" as const
    case "cancelled":
      return "cancelled" as const
    case "in_process":
    case "pending":
      return "in_process" as const
    default:
      return "pending" as const
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const paymentId = getPaymentId(request, body)

    if (!paymentId) {
      return NextResponse.json({ received: true, ignored: "missing payment id" }, { status: 200 })
    }

    const client = getMpClient()
    const payment = await new Payment(client).get({ id: paymentId })
    const externalReference = payment.external_reference

    if (!externalReference) {
      return NextResponse.json({ received: true, ignored: "missing external reference" }, { status: 200 })
    }

    const order = await findOrderByExternalReference(externalReference)
    if (!order) {
      return NextResponse.json({ received: true, ignored: "order not found" }, { status: 200 })
    }

    const isNewNotification = await registerPaymentNotification(paymentId)
    if (!isNewNotification) {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 })
    }

    const paymentStatus = mapPaymentStatus(payment.status)
    await setOrderPayment(order.id, paymentStatus, paymentId)

    if (paymentStatus === "rejected" || paymentStatus === "cancelled") {
      await restoreOrderStockIfNeeded(order.id)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Mercado Pago webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
