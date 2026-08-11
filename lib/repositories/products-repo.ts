import type { Product } from "@/lib/types"
import { getSupabaseAdminClient } from "@/lib/supabase/server"

function mapProductRowToDomain(row: {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: Product["category"]
  subcategory: Product["subcategory"] | null
  stock: number
  featured: boolean
}): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    image: row.image,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
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
