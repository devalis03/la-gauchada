"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { ShoppingCart, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import type { Product, ProductColor } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  compact?: boolean
  priceOverride?: number
  promoLabel?: string
}

function getColorClass(color: string) {
  const normalizedColor = color.toLowerCase()
  if (normalizedColor.includes("marron") || normalizedColor.includes("marrón")) return "bg-[#6b4428]"
  if (normalizedColor.includes("negro")) return "bg-black"
  if (normalizedColor.includes("rojo")) return "bg-red-600"
  if (normalizedColor.includes("verde")) return "bg-green-600"
  if (normalizedColor.includes("azul")) return "bg-blue-600"
  if (normalizedColor.includes("blanco")) return "bg-white"
  return "bg-muted"
}

export function ProductCard({ product, compact = false, priceOverride, promoLabel }: ProductCardProps) {
  const { addToCart, products } = useCart()
  const [isAdded, setIsAdded] = useState(false)
  const [error, setError] = useState(false)
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(product.colors?.[0])
  const availableColors = useMemo(() => product.colors ?? [], [product.colors])

  useEffect(() => {
    if (!selectedColor || !availableColors.includes(selectedColor)) {
      setSelectedColor(availableColors[0])
    }
  }, [availableColors, selectedColor])

  // Get current stock from context
  const currentProduct = products.find(p => p.id === product.id)
  const stock = currentProduct?.stock ?? product.stock

  const handleAddToCart = () => {
    const success = addToCart(product, 1, selectedColor, priceOverride)
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
  const displayPrice = priceOverride ?? product.price

  return (
    <Card className={`group h-full overflow-hidden border-0 py-0 transition-shadow hover:shadow-lg ${compact ? "flex flex-col" : ""}`}>
      <div className={`relative overflow-hidden bg-muted ${compact ? "aspect-[4/3]" : "aspect-square"}`}>
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
      <CardContent className={`flex flex-1 flex-col ${compact ? "p-3" : "p-4"}`}>
        <h3 className="font-medium text-foreground line-clamp-1">{product.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-foreground">{formatPrice(displayPrice)}</span>
              {priceOverride !== undefined && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>}
            </div>
            {availableColors.length > 0 && (
              <div className="mt-2 flex items-center gap-2" aria-label="Color del producto">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Color ${color}`}
                    aria-pressed={selectedColor === color}
                    title={color}
                    onClick={() => setSelectedColor(color)}
                    className={`h-6 w-6 rounded-sm border-2 ${getColorClass(color)} ${selectedColor === color ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                  >
                    <span className="sr-only">{color}</span>
                  </button>
                ))}
              </div>
            )}
            {promoLabel && <p className="mt-1 text-xs font-medium text-primary">{promoLabel}</p>}
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
