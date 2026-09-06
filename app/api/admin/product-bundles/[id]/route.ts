import { NextResponse } from "next/server"
import { getProductBundle, saveProductBundle } from "@/lib/repositories/products-repo"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const bundle = await getProductBundle(id)
  return NextResponse.json({ data: bundle?.components ?? [] })
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as { components?: unknown }
    if (!Array.isArray(body.components) || body.components.length === 0) {
      return NextResponse.json({ error: "La promo debe tener componentes" }, { status: 400 })
    }

    const rawComponents = body.components.map((component) => {
      const item = component as { productId?: unknown; quantity?: unknown }
      return { productId: item.productId, quantity: item.quantity }
    })
    if (rawComponents.some((component) => typeof component.productId !== "string" || !Number.isInteger(component.quantity) || (component.quantity as number) < 1)) {
      return NextResponse.json({ error: "Componentes inválidos" }, { status: 400 })
    }
    const components = rawComponents as { productId: string; quantity: number }[]

    const supabase = getSupabaseAdminClient()
    const { data: products, error } = await supabase
      .from("products")
      .select("id, category")
      .in("id", [id, ...components.map((component) => component.productId)])
    if (error) throw new Error(error.message)

    const productMap = new Map((products ?? []).map((product) => [product.id, product]))
    if (productMap.get(id)?.category !== "promos") {
      return NextResponse.json({ error: "Solo un producto promo puede tener componentes" }, { status: 400 })
    }
    if (components.some((component) => component.productId === id || productMap.get(component.productId)?.category === "promos")) {
      return NextResponse.json({ error: "Las promos solo pueden contener productos simples" }, { status: 400 })
    }
    if (components.some((component) => !productMap.has(component.productId))) {
      return NextResponse.json({ error: "Uno de los productos no existe" }, { status: 400 })
    }

    const bundle = await saveProductBundle({ productId: id, components })
    return NextResponse.json({ data: bundle }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar la promo"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
