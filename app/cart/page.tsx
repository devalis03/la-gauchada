"use client"

import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/utils"

export default function CartPage() {
  const { items, products, removeFromCart, updateQuantity, getCartTotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
        <h1 className="mt-6 font-serif text-2xl font-bold text-foreground">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 text-muted-foreground">
          Parece que aún no has agregado productos.
        </p>
        <Link href="/products">
          <Button className="mt-6 gap-2">
            <ShoppingBag className="h-4 w-4" />
            Empezar a Comprar
          </Button>
        </Link>
      </div>
    )
  }

  const subtotal = getCartTotal()
  const shipping = subtotal > 50 ? 0 : 8.99
  const total = subtotal + shipping

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Carrito de Compras
          </h1>
          <p className="mt-2 text-muted-foreground">
            {items.length} {items.length === 1 ? "artículo" : "artículos"} en tu carrito
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => {
              const currentProduct = products.find((p) => p.id === item.product.id)
              const maxStock = currentProduct?.stock ?? item.product.stock
              const isOverStock = item.quantity > maxStock

              return (
                <Card key={item.product.id} className={isOverStock ? "border-destructive" : ""}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-foreground">
                              {item.product.name}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatPrice(item.product.price)} c/u
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.product.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar artículo</span>
                          </Button>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                              <span className="sr-only">Disminuir cantidad</span>
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= maxStock}
                            >
                              <Plus className="h-3 w-3" />
                              <span className="sr-only">Aumentar cantidad</span>
                            </Button>
                          </div>

                          {/* Line Total */}
                          <p className="font-semibold text-foreground">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>

                        {isOverStock && (
                          <p className="mt-2 text-sm text-destructive">
                            Solo hay {maxStock} disponibles. Reduce la cantidad.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="mt-8 lg:mt-0">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium">
                    {shipping === 0 ? "Gratis" : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Envío gratis en pedidos mayores a $50
                  </p>
                )}
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/checkout" className="w-full">
                  <Button className="w-full gap-2">
                    Ir a Checkout
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
