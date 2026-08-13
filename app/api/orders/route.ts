import { NextRequest, NextResponse } from "next/server"
import type { Order } from "@/lib/types"
import { createOrderRecord, listOrders } from "@/lib/repositories/orders-repo"

export async function GET() {
  try {
    const orders = await listOrders()
    return NextResponse.json({ data: orders }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { order?: Order }
    if (!body.order) {
      return NextResponse.json({ error: "Missing order payload" }, { status: 400 })
    }

    const created = await createOrderRecord(body.order)
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
