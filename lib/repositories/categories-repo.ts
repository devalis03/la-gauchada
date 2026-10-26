import { getSupabaseAdminClient } from "@/lib/supabase/server"
import type { CategoryDefinition } from "@/lib/types"

function mapCategoryRow(row: {
  id: string
  name: string
  description: string
  image: string
  active: boolean
}): CategoryDefinition {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    active: row.active,
  }
}

export async function listCategories(includeInactive = false): Promise<CategoryDefinition[]> {
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from("categories")
    .select("id, name, description, image, active")
    .order("name", { ascending: true })

  if (!includeInactive) query = query.eq("active", true)

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch categories: ${error.message}`)
  return (data ?? []).map(mapCategoryRow)
}

export async function getCategoryById(id: string, includeInactive = false): Promise<CategoryDefinition | null> {
  const supabase = getSupabaseAdminClient()
  let query = supabase
    .from("categories")
    .select("id, name, description, image, active")
    .eq("id", id)

  if (!includeInactive) query = query.eq("active", true)

  const { data, error } = await query.maybeSingle()
  if (error) throw new Error(`Failed to fetch category: ${error.message}`)
  return data ? mapCategoryRow(data) : null
}

export async function createCategory(input: Omit<CategoryDefinition, "active">): Promise<CategoryDefinition> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("categories")
    .insert({ ...input, active: true })
    .select("id, name, description, image, active")
    .single()

  if (error) throw new Error(`Failed to create category: ${error.message}`)
  return mapCategoryRow(data)
}

export async function updateCategory(
  id: string,
  update: Partial<Pick<CategoryDefinition, "name" | "description" | "image" | "active">>,
): Promise<CategoryDefinition | null> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("categories")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, name, description, image, active")
    .maybeSingle()

  if (error) throw new Error(`Failed to update category: ${error.message}`)
  return data ? mapCategoryRow(data) : null
}
