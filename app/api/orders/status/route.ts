import { NextRequest, NextResponse } from "next/server"
import type { Order } from "@/lib/types"
import { setOrderStatus } from "@/lib/repositories/orders-repo"
import { sendOrderConfirmationEmails } from "@/lib/email-service"

export async function PATCH(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get("orderId")
    const body = (await request.json()) as {
      status?: Order["status"]
      transferenceStatus?: Order["transferenceStatus"]
    }

    if (!orderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 })
    }

    if (!body.status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 })
    }

    const updated = await setOrderStatus(orderId, body.status, body.transferenceStatus)

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (
      updated.paymentMethod === "transferencia" &&
      updated.transferenceStatus === "confirmado" &&
      updated.paymentStatus === "approved"
    ) {
      try {
        await sendOrderConfirmationEmails(updated)
      } catch (emailError) {
        console.error("Transfer confirmation email error:", emailError)
      }
    }

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
