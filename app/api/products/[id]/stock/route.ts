import { NextRequest, NextResponse } from "next/server"
import { updateProductStock } from "@/lib/repositories/products-repo"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as { stock?: unknown }

    if (typeof body.stock !== "number" || !Number.isInteger(body.stock) || body.stock < 0) {
      return NextResponse.json({ error: "Stock inválido" }, { status: 400 })
    }

    const product = await updateProductStock(id, body.stock)
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ data: product }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el stock"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
