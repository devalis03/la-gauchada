import { NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

type PreferencePayload = {
  items: Array<{
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
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: "approved" | "all"
  external_reference?: string
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

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "No hay items para crear la preferencia" }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || req.nextUrl.origin
    const backUrls = {
      success: body.back_urls?.success || `${baseUrl}/checkout/success`,
      failure: body.back_urls?.failure || `${baseUrl}/checkout?payment=failure`,
      pending: body.back_urls?.pending || `${baseUrl}/checkout?payment=pending`,
    }

    const canUseBackUrls = !isLocalhostUrl(backUrls.success)

    const client = getMpClient()
    const preference = new Preference(client)

    const mappedItems = body.items.map((item, index) => ({
      id: `item-${index + 1}`,
      title: item.title,
      quantity: item.quantity,
      currency_id: item.currency_id,
      unit_price: item.unit_price,
    }))

    const preferenceBody: {
      items: Array<{
        id: string
        title: string
        quantity: number
        currency_id: string
        unit_price: number
      }>
      payer: PreferencePayload["payer"]
      external_reference?: string
      back_urls?: PreferencePayload["back_urls"]
      auto_return?: "approved" | "all"
    } = {
      items: mappedItems,
      payer: body.payer,
      external_reference: body.external_reference,
    }

    if (canUseBackUrls) {
      preferenceBody.back_urls = backUrls
      preferenceBody.auto_return = body.auto_return || "approved"
    }

    const response = await preference.create({
      body: preferenceBody,
    })

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
