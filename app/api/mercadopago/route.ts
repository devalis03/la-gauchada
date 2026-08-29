import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"
import {
  findOrderById,
  restoreOrderStockIfNeeded,
  setOrderExternalReference,
} from "@/lib/repositories/orders-repo"

type PreferencePayload = {
  orderId?: string
}

function getMpClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error("Missing MERCADOPAGO_ACCESS_TOKEN")
  }

  return new MercadoPagoConfig({ accessToken })
}

function isLocalhostUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1"
    )
  } catch {
    return true
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PreferencePayload

    if (!body.orderId) {
      return NextResponse.json({ error: "Falta el identificador del pedido" }, { status: 400 })
    }

    const order = await findOrderById(body.orderId)
    if (!order || order.paymentMethod !== "tarjeta") {
      return NextResponse.json({ error: "Pedido inválido para pago con tarjeta" }, { status: 400 })
    }

    const configuredBaseUrl = process.env.APP_URL || req.headers.get("origin") || req.nextUrl.origin
    const baseUrl = configuredBaseUrl.replace(/\/$/, "")
    const backUrls = {
      success: `${baseUrl}/checkout/success?orderId=${encodeURIComponent(order.id)}`,
      failure: `${baseUrl}/checkout?payment=failure&orderId=${encodeURIComponent(order.id)}`,
      pending: `${baseUrl}/checkout?payment=pending&orderId=${encodeURIComponent(order.id)}`,
    }

    const canUseBackUrls = !isLocalhostUrl(backUrls.success)

    const client = getMpClient()
    const preference = new Preference(client)

    const mappedItems = order.items.map((item) => ({
      id: item.product.id,
      title: item.product.name,
      quantity: item.quantity,
      currency_id: "ARS",
      unit_price: Number(item.product.price),
    }))

    const preferenceBody: {
      items: Array<{
        id: string
        title: string
        quantity: number
        currency_id: string
        unit_price: number
      }>
      payer: {
        name: string
        surname: string
        email: string
      }
      external_reference: string
      notification_url?: string
      back_urls?: typeof backUrls
      auto_return?: "approved" | "all"
    } = {
      items: mappedItems,
      payer: {
        name: order.customer.firstName,
        surname: order.customer.lastName,
        email: order.customer.email,
      },
      external_reference: order.id,
    }

    if (canUseBackUrls) {
      preferenceBody.back_urls = backUrls
      preferenceBody.auto_return = "approved"
      preferenceBody.notification_url = `${baseUrl}/api/mercadopago/webhook`
    }

    let response
    try {
      response = await preference.create({
        body: preferenceBody,
      })
    } catch (error) {
      await restoreOrderStockIfNeeded(order.id)
      throw error
    }

    await setOrderExternalReference(order.id, order.id)

    return NextResponse.json(
      {
        init_point: response.init_point,
        id: response.id,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Mercado Pago API route error:", error)

    const maybeError = error as {
      message?: string
      status?: number
      cause?: {
        message?: string
        error?: string
        status?: number
        cause?: unknown
      }
    }

    const status =
      maybeError?.status ??
      maybeError?.cause?.status ??
      500

    const message =
      maybeError?.cause?.message ??
      maybeError?.message ??
      "Mercado Pago request failed"

    return NextResponse.json(
      {
        error: message,
        details: maybeError?.cause?.cause ?? maybeError?.cause?.error ?? null,
      },
      { status }
    )
  }
}
