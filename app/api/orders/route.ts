import { NextRequest, NextResponse } from "next/server"
import type { Order } from "@/lib/types"
import { createOrderRecord, listOrders } from "@/lib/repositories/orders-repo"
import {
  listProducts,
  reserveOrderStock,
} from "@/lib/repositories/products-repo"

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
    const body = (await req.json().catch(() => null)) as { order?: Order } | null
    if (!body?.order || !Array.isArray(body.order.items)) {
      return NextResponse.json({ error: "Missing order payload" }, { status: 400 })
    }

    const submittedOrder = body.order

    if (
      submittedOrder.items.length === 0 ||
      submittedOrder.items.some(
        (item) =>
          !item?.product?.id ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1
      ) ||
      !["efectivo", "tarjeta", "transferencia"].includes(submittedOrder.paymentMethod)
    ) {
      return NextResponse.json({ error: "El pedido no contiene cantidades válidas" }, { status: 400 })
    }

    const products = await listProducts()
    const productsById = new Map(products.map((product) => [product.id, product]))
    const items = submittedOrder.items.map((item) => {
      const product = productsById.get(item.product.id)
      return product ? { product, quantity: item.quantity } : null
    })

    if (items.some((item) => item === null)) {
      return NextResponse.json({ error: "El pedido contiene un producto inválido" }, { status: 400 })
    }

    const trustedItems = items as Order["items"]
    const subtotal = trustedItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    const shipping = subtotal > 50 ? 0 : 8.99
    const order: Order = {
      ...submittedOrder,
      items: trustedItems,
      subtotal,
      shipping,
      total: subtotal + shipping,
    }

    let stockItems
    try {
      stockItems = await reserveOrderStock(
        order.items.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
      )
    } catch (reservationError) {
      if (reservationError instanceof Error && reservationError.message.includes("Stock insuficiente")) {
        return NextResponse.json({ error: "Stock insuficiente" }, { status: 409 })
      }
      throw reservationError
    }

    order.items = order.items.map((item, index) => (
      index === 0 ? { ...item, stockItems } : item
    ))

    try {
      const created = await createOrderRecord(order)
      return NextResponse.json({ data: created }, { status: 201 })
    } catch (createError) {
      // La RPC de restauración es idempotente y devuelve el stock reservado.
      const supabase = await import("@/lib/supabase/server")
      await supabase.getSupabaseAdminClient().rpc("restore_order_stock", { p_order_id: order.id })
      throw createError
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
