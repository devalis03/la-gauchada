import { NextRequest, NextResponse } from "next/server"
import type { Order } from "@/lib/types"
import { createOrderRecord, listOrders } from "@/lib/repositories/orders-repo"
import { decrementProductStock, incrementProductStock } from "@/lib/repositories/products-repo"

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

    const order = body.order

    if (
      order.items.length === 0 ||
      order.items.some(
        (item) => !Number.isInteger(item.quantity) || item.quantity < 1
      )
    ) {
      return NextResponse.json({ error: "El pedido no contiene cantidades válidas" }, { status: 400 })
    }

    // Reserva stock de forma atómica; si algún producto falla, se libera lo ya reservado.
    const reserved: { productId: string; quantity: number }[] = []
    for (const item of order.items) {
      const ok = await decrementProductStock(item.product.id, item.quantity)
      if (!ok) {
        for (const previous of reserved) {
          await incrementProductStock(previous.productId, previous.quantity)
        }
        return NextResponse.json(
          {
            error: "Stock insuficiente",
            productId: item.product.id,
            productName: item.product.name,
          },
          { status: 409 }
        )
      }
      reserved.push({ productId: item.product.id, quantity: item.quantity })
    }

    try {
      const created = await createOrderRecord(order)
      return NextResponse.json({ data: created }, { status: 201 })
    } catch (createError) {
      // El pedido no se pudo guardar; libera el stock reservado.
      for (const previous of reserved) {
        await incrementProductStock(previous.productId, previous.quantity)
      }
      throw createError
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
