import type { CartItem, Product } from "./types"

export const PICO_DE_ORO_ID = "bombilla-001"
export const MATE_BOMBILLA_PROMO_PRICE = 5500

export function hasMateInCart(items: CartItem[]): boolean {
  return items.some((item) => item.product.category === "mates")
}

export function getCartItemPrice(item: CartItem): number {
  return item.priceOverride ?? item.product.price
}

export function getRecommendedPrice(product: Product, items: CartItem[]): number {
  if (product.id === PICO_DE_ORO_ID && hasMateInCart(items)) {
    return MATE_BOMBILLA_PROMO_PRICE
  }

  return product.price
}