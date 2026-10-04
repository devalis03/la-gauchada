import { NextRequest, NextResponse } from "next/server"
import { findOrderById } from "@/lib/repositories/orders-repo"

export async function GET(request: NextRequest) {
  try {
    const orderId = request.nextUrl.searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 })
    }

    const order = await findOrderById(orderId)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ data: order }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
