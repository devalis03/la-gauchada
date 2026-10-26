import type { Product } from "./types"

const ENGRAVING_CATEGORIES = new Set<Product["category"]>(["mates", "yerberos", "termos", "bombillas"])

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export function canProductBeEngraved(product: Pick<Product, "category" | "name" | "description">) {
  if (ENGRAVING_CATEGORIES.has(product.category)) return true
  if (product.category !== "cuchillos-tablas") return false

  const searchableText = normalizeSearchText(`${product.name} ${product.description}`)
  return /\bcuchillos?\b/.test(searchableText)
}
