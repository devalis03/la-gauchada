import { NextResponse } from "next/server"
import { listProducts } from "@/lib/repositories/products-repo"

export async function GET() {
  try {
    const products = await listProducts()
    return NextResponse.json({ data: products }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
