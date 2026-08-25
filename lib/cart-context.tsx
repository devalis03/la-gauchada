"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { Product, CartItem } from "./types"
import { initialProducts } from "./products"

interface CartContextType {
  items: CartItem[]
  products: Product[]
  addToCart: (product: Product, quantity?: number) => boolean
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => boolean
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  completePurchase: () => boolean
  updateStock: (productId: string, newStock: number) => Promise<boolean>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = "mate-shop-cart"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch {
        // Invalid cart data, use empty cart
      }
    }
    
    setIsHydrated(true)
  }, [])

  // Fetch shared products from backend (source of truth: database)
  useEffect(() => {
    let isCancelled = false

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          method: "GET",
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("No se pudieron cargar los productos")
        }

        const payload = await response.json() as { data?: Product[] }
        const dbProducts = payload.data

        if (!Array.isArray(dbProducts) || dbProducts.length === 0) {
          throw new Error("Respuesta inválida de productos")
        }

        if (!isCancelled) {
          setProducts(dbProducts)
          // Keep cart item product snapshots aligned with latest catalog data.
          setItems((prev) =>
            prev
              .map((item) => {
                const current = dbProducts.find((product) => product.id === item.product.id)
                if (!current) return null
                return {
                  ...item,
                  product: current,
                }
              })
              .filter((item): item is CartItem => item !== null)
          )
        }
      } catch {
        if (!isCancelled) {
          // Development-safe fallback to avoid blocking the storefront.
          setProducts(initialProducts)
        }
      }
    }

    void loadProducts()

    return () => {
      isCancelled = true
    }
  }, [])

  // Persist cart to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isHydrated])

  const addToCart = useCallback((product: Product, quantity = 1): boolean => {
    const currentProduct = products.find(p => p.id === product.id)
    if (!currentProduct) return false

    const existingItem = items.find(item => item.product.id === product.id)
    const currentQty = existingItem?.quantity || 0
    const newQty = currentQty + quantity

    if (newQty > currentProduct.stock) {
      return false // Not enough stock
    }

    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { product: currentProduct, quantity }]
    })
    return true
  }, [items, products])

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number): boolean => {
    if (quantity < 1) {
      removeFromCart(productId)
      return true
    }

    const product = products.find(p => p.id === productId)
    if (!product || quantity > product.stock) {
      return false // Not enough stock
    }

    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    )
    return true
  }, [products, removeFromCart])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }, [items])

  const getCartCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }, [items])

  const completePurchase = useCallback((): boolean => {
    // Check if all items have sufficient stock
    for (const item of items) {
      const product = products.find(p => p.id === item.product.id)
      if (!product || product.stock < item.quantity) {
        return false
      }
    }

    // Decrease stock
    setProducts(prev =>
      prev.map(product => {
        const cartItem = items.find(item => item.product.id === product.id)
        if (cartItem) {
          return { ...product, stock: product.stock - cartItem.quantity }
        }
        return product
      })
    )

    // Clear cart
    clearCart()
    return true
  }, [items, products, clearCart])

  const updateStock = useCallback(async (productId: string, newStock: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ stock: Math.max(0, newStock) }),
      })

      const payload = await response.json() as { data?: Product; error?: string }
      if (!response.ok || !payload.data) {
        return false
      }

      setProducts(prev =>
        prev.map(product => product.id === productId ? payload.data! : product)
      )
      return true
    } catch {
      return false
    }
  }, [])

  return (
    <CartContext.Provider
      value={{
        items,
        products,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        completePurchase,
        updateStock,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
