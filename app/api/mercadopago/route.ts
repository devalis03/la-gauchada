import { NextRequest, NextResponse } from "next/server";
import * as mercadopago from "mercadopago";

// Usa tu Access Token de prueba aquí (mejor si luego lo pasas a variable de entorno)
const ACCESS_TOKEN = "APP_USR-5898838466411199-050719-d1729fc6bdf3083507a9c6c30071fe34-3385710315";

mercadopago.configure({
  access_token: ACCESS_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Espera: items, payer, back_urls, auto_return
    const preference = {
      items: body.items,
      payer: body.payer,
      back_urls: body.back_urls,
      auto_return: body.auto_return,
    };
    try {
      const response = await mercadopago.preferences.create(preference);
      return NextResponse.json({ init_point: response.body.init_point });
    } catch (sdkError: any) {
      console.error("Mercado Pago SDK error:", sdkError);
      return NextResponse.json({ error: sdkError.message, details: sdkError }, { status: 500 });
    }
  } catch (error: any) {
    console.error("API route error:", error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
}
