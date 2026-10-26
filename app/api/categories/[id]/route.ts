import { NextResponse } from "next/server"
import { updateCategory } from "@/lib/repositories/categories-repo"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json() as { active?: boolean }
    if (typeof body.active !== "boolean") {
      return NextResponse.json({ error: "El estado de la categoría es inválido" }, { status: 400 })
    }

    const category = await updateCategory(id, { active: body.active })
    if (!category) return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    return NextResponse.json({ data: category }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la categoría"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
