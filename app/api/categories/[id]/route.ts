import { NextResponse } from "next/server"
import { updateCategory } from "@/lib/repositories/categories-repo"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json() as { active?: boolean; name?: string; description?: string; image?: string }
    const update: { active?: boolean; name?: string; description?: string; image?: string } = {}
    if (typeof body.active === "boolean") update.active = body.active
    if (typeof body.name === "string") {
      const name = body.name.trim()
      if (!name) return NextResponse.json({ error: "El nombre de la categoría es obligatorio" }, { status: 400 })
      update.name = name
    }
    if (typeof body.description === "string") update.description = body.description.trim()
    if (typeof body.image === "string" && body.image.trim()) update.image = body.image.trim()
    if (Object.keys(update).length === 0) return NextResponse.json({ error: "No hay cambios válidos para guardar" }, { status: 400 })

    const category = await updateCategory(id, update)
    if (!category) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    return NextResponse.json({ data: category }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la categoría"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
