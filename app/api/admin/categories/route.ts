import { NextResponse } from "next/server"
import { listCategories } from "@/lib/repositories/categories-repo"

export async function GET() {
  try {
    const categories = await listCategories(true)
    return NextResponse.json({ data: categories }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron cargar las categorías"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
