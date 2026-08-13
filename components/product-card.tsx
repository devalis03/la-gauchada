"use client"

import Image from "next/image"
import { useState } from "react"
import { ShoppingCart, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, products } = useCart()
  const [isAdded, setIsAdded] = useState(false)
  const [error, setError] = useState(false)

  // Get current stock from context
  const currentProduct = products.find(p => p.id === product.id)
  const stock = currentProduct?.stock ?? product.stock

  const handleAddToCart = () => {
    const success = addToCart(product)
    if (success) {
      setIsAdded(true)
      setError(false)
      setTimeout(() => setIsAdded(false), 2000)
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  const isOutOfStock = stock === 0
  const isLowStock = stock > 0 && stock <= 5

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <span className="text-base font-semibold text-destructive">Agotado</span>
          </div>
        )}
        {product.featured && !isOutOfStock && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Destacado
          </span>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-foreground line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="text-lg font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
            {isLowStock && !isOutOfStock && (
              <p className="text-xs text-accent">Solo {stock} disponibles</p>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdded}
            variant={isOutOfStock ? "secondary" : isAdded ? "secondary" : error ? "destructive" : "default"}
            className={`gap-1.5 ${isOutOfStock ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isOutOfStock ? (
              <>
                <AlertCircle className="h-4 w-4" />
                Agotado
              </>
            ) : isAdded ? (
              <>
                <Check className="h-4 w-4" />
                Agregado
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-4 w-4" />
                Sin Stock
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
