import { NextResponse } from "next/server"
import { listProducts } from "@/lib/repositories/products-repo"

export async function GET() {
  try {
    const products = await listProducts(true)
    return NextResponse.json({ data: products }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron cargar los productos"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}