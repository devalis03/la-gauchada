import { NextResponse } from "next/server"
import { createProduct, getNextProductId, listProducts } from "@/lib/repositories/products-repo"
import type { Product } from "@/lib/types"

export async function GET() {
  try {
    const products = await listProducts()
    return NextResponse.json({ data: products }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Product>
    const product = validateProductInput(body)

    if (!product) {
      return NextResponse.json({ error: "Datos de producto inválidos" }, { status: 400 })
    }

    const created = await createProduct({ ...product, id: await getNextProductId(product.category) })
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear el producto"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function validateProductInput(body: Partial<Product>) {
  if (
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
    id: body.id,
    name: body.name.trim(),
    description: body.description.trim(),
    price: body.price,
    image: body.image.trim(),
    category: body.category as Product["category"],
    subcategory: body.subcategory ?? null,
    stock: body.category === "promos" ? 0 : body.stock,
    featured: body.featured === true,
    active: body.active !== false,
  }
}
