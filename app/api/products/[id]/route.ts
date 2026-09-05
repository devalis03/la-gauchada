import { NextResponse } from "next/server"
import { updateProduct } from "@/lib/repositories/products-repo"
import type { Product } from "@/lib/types"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as Partial<Product>
    const input = validateProductInput(body)

    if (!input) {
      return NextResponse.json({ error: "Datos de producto inválidos" }, { status: 400 })
    }

    const updated = await updateProduct(id, input)
    if (!updated) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ data: updated }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar el producto"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function validateProductInput(body: Partial<Product>) {
  if (
    typeof body.id !== "string" ||
    typeof body.name !== "string" || !body.name.trim() ||
    typeof body.description !== "string" || !body.description.trim() ||
    typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0 ||
    typeof body.image !== "string" || !body.image.trim() ||
    typeof body.category !== "string" ||
    !["promos", "mates", "materas", "yerberos", "termos", "bombillas", "otros"].includes(body.category) ||
    (body.subcategory !== undefined && body.subcategory !== null &&
      !["mates-imperiales", "mates-tradicionales", "mates-torpedos"].includes(body.subcategory)) ||
    typeof body.stock !== "number" || !Number.isInteger(body.stock) || body.stock < 0
  ) {
    return null
  }

  return {
    name: body.name.trim(),
    description: body.description.trim(),
    price: body.price,
    image: body.image.trim(),
    category: body.category as Product["category"],
    subcategory: body.subcategory ?? null,
    stock: body.stock,
    featured: body.featured === true,
    active: body.active !== false,
  }
}