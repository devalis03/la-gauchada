import { NextRequest, NextResponse } from "next/server"
import type { Order } from "@/lib/types"
import { setOrderStatus } from "@/lib/repositories/orders-repo"

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = (await req.json()) as {
      status?: Order["status"]
      transferenceStatus?: Order["transferenceStatus"]
    }

    if (!body.status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 })
    }

    const updated = await setOrderStatus(id, body.status, body.transferenceStatus)

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
