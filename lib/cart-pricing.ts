import type { CartItem, Product } from "./types"

export const PICO_DE_ORO_ID = "bombilla-001"
export const MATE_BOMBILLA_PROMO_PRICE = 5500
export const ENGRAVING_PRICE = 5000

export function hasMateInCart(items: CartItem[]): boolean {
  return items.some((item) => item.product.category === "mates")
}

export function getCartItemPrice(item: CartItem): number {
  return (item.priceOverride ?? item.product.price) + (item.engraving ? ENGRAVING_PRICE : 0)
}

export function getRecommendedPrice(product: Product, items: CartItem[]): number {
  if (product.id === PICO_DE_ORO_ID && hasMateInCart(items)) {
    return MATE_BOMBILLA_PROMO_PRICE
  }

  return product.price
}