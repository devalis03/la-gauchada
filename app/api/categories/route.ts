import { NextResponse } from "next/server"
import { createCategory, listCategories } from "@/lib/repositories/categories-repo"

export async function GET() {
  try {
    const categories = await listCategories()
    return NextResponse.json({ data: categories }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudieron cargar las categorías"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { id?: string; name?: string; description?: string; image?: string }
    const name = body.name?.trim()
    const id = body.id?.trim().toLowerCase()
    const image = body.image?.trim()

    if (!id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || !name || !image) {
      return NextResponse.json({ error: "La categoría necesita un identificador, nombre e imagen válidos" }, { status: 400 })
    }

    const category = await createCategory({
      id,
      name,
      description: body.description?.trim() ?? "",
      image,
    })
    return NextResponse.json({ data: category }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo crear la categoría"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
