import type { Product, ProductBundle, StockItem } from "@/lib/types"
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
  active?: boolean
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
    active: row.active ?? true,
  }
}

const productSelect = "id, name, description, price, image, category, subcategory, stock, featured, active"

export async function listProducts(includeInactive = false): Promise<Product[]> {
  const supabase = getSupabaseAdminClient()

  let query = supabase
    .from("products")
    .select(productSelect)
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  if (!includeInactive) {
    query = query.eq("active", true)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  const mappedProducts = (data ?? []).map(mapProductRowToDomain)
  const promoIds = mappedProducts.filter((product) => product.category === "promos").map((product) => product.id)
  if (promoIds.length === 0) return mappedProducts

  const { data: bundles, error: bundleError } = await supabase
    .from("product_bundles")
    .select("product_id, components")
    .in("product_id", promoIds)
  if (bundleError) throw new Error(`Failed to fetch product bundles: ${bundleError.message}`)

  const stockById = new Map(mappedProducts.map((product) => [product.id, product.stock]))
  const bundleById = new Map((bundles ?? []).map((bundle) => [bundle.product_id, bundle.components as ProductBundle["components"]]))
  return mappedProducts.map((product) => {
    if (product.category !== "promos") return product
    const components = bundleById.get(product.id) ?? []
    const available = components.length === 0
      ? 0
      : Math.min(...components.map((component) => Math.floor((stockById.get(component.productId) ?? 0) / component.quantity)))
    return { ...product, stock: available }
  })
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
    .select(productSelect)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to update product stock: ${error.message}`)
  }

  return data ? mapProductRowToDomain(data) : null
}

export type ProductInput = {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: Product["category"]
  subcategory?: Product["subcategory"] | null
  stock: number
  featured: boolean
  active: boolean
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select(productSelect)
    .single()

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`)
  }

  return mapProductRowToDomain(data)
}

export async function getNextProductId(category: Product["category"]): Promise<string> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.rpc("next_product_id", { p_category: category })
  if (error) throw new Error(`Failed to generate product id: ${error.message}`)
  return data
}

export async function updateProduct(
  productId: string,
  input: Omit<ProductInput, "id">
): Promise<Product | null> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", productId)
    .select(productSelect)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`)
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

export async function getProductBundle(productId: string): Promise<ProductBundle | null> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("product_bundles")
    .select("product_id, components")
    .eq("product_id", productId)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch product bundle: ${error.message}`)
  return data ? { productId: data.product_id, components: data.components as ProductBundle["components"] } : null
}

export async function saveProductBundle(bundle: ProductBundle): Promise<ProductBundle> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("product_bundles")
    .upsert({ product_id: bundle.productId, components: bundle.components })
    .select("product_id, components")
    .single()

  if (error) throw new Error(`Failed to save product bundle: ${error.message}`)
  return { productId: data.product_id, components: data.components as ProductBundle["components"] }
}

export async function reserveOrderStock(items: { productId: string; quantity: number }[]): Promise<StockItem[]> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.rpc("reserve_order_stock", { p_items: items })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as StockItem[]
}
