import type { Product } from "@/lib/types"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

function mapProductRowToDomain(row: {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  subcategory: string | null
  stock: number
  featured: boolean
}): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image,
    category: row.category as Product["category"],
    subcategory: row.subcategory as Product["subcategory"] | undefined,
    stock: row.stock,
    featured: row.featured,
  }
}

export async function listProducts(): Promise<Product[]> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, price, image, category, subcategory, stock, featured")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  return (data ?? []).map(mapProductRowToDomain)
}

export async function updateProductStock(
  productId: string,
  stock: number
): Promise<Product | null> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("products")
    .update({ stock: Math.max(0, stock) })
    .eq("id", productId)
    .select("id, name, description, price, image, category, subcategory, stock, featured")
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to update product stock: ${error.message}`)
  }

  return data ? mapProductRowToDomain(data) : null
}

// Descuenta stock solo si hay suficiente disponible (evita sobreventa por condición de carrera).
export async function decrementProductStock(
  productId: string,
  quantity: number
): Promise<boolean> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.rpc("decrement_product_stock", {
    p_id: productId,
    p_quantity: quantity,
  })

  if (error) {
    throw new Error(`Failed to decrement stock: ${error.message}`)
  }

  return (data ?? []).length > 0
}

export async function incrementProductStock(productId: string, quantity: number): Promise<void> {
  const supabase = getSupabaseAdminClient()
  const { error } = await supabase.rpc("increment_product_stock", {
    p_id: productId,
    p_quantity: quantity,
  })

  if (error) {
    throw new Error(`Failed to restore stock: ${error.message}`)
  }
}
