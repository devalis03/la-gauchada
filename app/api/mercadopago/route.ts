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
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  auto_return: "approved" | "all"
  external_reference?: string
}

function getMpClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error("Missing MERCADOPAGO_ACCESS_TOKEN")
  }

  return new MercadoPagoConfig({ accessToken })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PreferencePayload
    const client = getMpClient()
    const preference = new Preference(client)

    const response = await preference.create({
      body: {
        items: body.items,
        payer: body.payer,
        back_urls: body.back_urls,
        auto_return: body.auto_return,
        external_reference: body.external_reference,
      },
    })

    return NextResponse.json(
      {
        init_point: response.init_point,
        id: response.id,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mercado Pago request failed"
    console.error("Mercado Pago API route error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
