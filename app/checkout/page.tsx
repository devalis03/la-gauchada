
"use client"
import { formatPrice } from "@/lib/utils"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Check, AlertCircle, Loader2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { createOrder, saveOrder } from "@/lib/order-service"
import type { CustomerInfo } from "@/lib/types"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, products, getCartTotal, completePurchase } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "transferencia" | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [formData, setFormData] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    dni: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
    paymentMethod: "efectivo",
  })

  const subtotal = getCartTotal()
  const shipping = subtotal > 50 ? 0 : 8.99
  const total = subtotal + shipping

  const stockIssues = items.filter((item) => {
    const currentProduct = products.find((p) => p.id === item.product.id)
    return !currentProduct || currentProduct.stock < item.quantity
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handlePaymentMethodSelect = (method: "efectivo" | "tarjeta" | "transferencia") => {
    setPaymentMethod(method)
    setFormData((prev) => ({ ...prev, paymentMethod: method }))
    setError(null)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!paymentMethod) {
      setError("Por favor selecciona un método de pago")
      setIsSubmitting(false)
      return
    }

    const requiredFields: (keyof CustomerInfo)[] = [
      "firstName",
      "lastName",
      "age",
      "gender",
      "dni",
      "phone",
      "email",
      "address",
      "city",
      "postalCode",
    ]
    const missingFields = requiredFields.filter((field) => !formData[field])

    if (missingFields.length > 0) {
      setError("Por favor completa todos los campos obligatorios.")
      setIsSubmitting(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Por favor ingresa un correo electrónico válido.")
      setIsSubmitting(false)
      return
    }

    if (stockIssues.length > 0) {
      setError("Algunos artículos en tu carrito ya no están disponibles.")
      setIsSubmitting(false)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Si el método es tarjeta, crear preferencia en Mercado Pago y redirigir
    if (paymentMethod === "tarjeta") {
      try {
        // Construir items para Mercado Pago
        const mpItems = items.map((item) => ({
          title: item.product.name,
          quantity: item.quantity,
          currency_id: "ARS",
          unit_price: Number(item.product.price),
        }))
        // Usar la API interna para crear la preferencia
        const preferenceBody = {
          items: mpItems,
          payer: {
            name: formData.firstName,
            surname: formData.lastName,
            email: formData.email,
          },
          back_urls: {
            success: `${window.location.origin}/checkout/success`,
            failure: `${window.location.origin}/checkout?payment=failure`,
            pending: `${window.location.origin}/checkout?payment=pending`,
          },
          auto_return: "approved",
        }
        const res = await fetch("/api/mercadopago", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(preferenceBody),
        })
        let data
        try {
          data = await res.json()
        } catch (jsonErr) {
          setError("Error inesperado al procesar la respuesta de Mercado Pago.")
          setIsSubmitting(false)
          return
        }
        if (!res.ok) {
          // Mostrar mensaje de error devuelto por la API
          const mpMsg = data && data.message ? data.message : JSON.stringify(data)
          setError(`Mercado Pago: ${mpMsg}`)
          console.error("Mercado Pago error:", data)
          setIsSubmitting(false)
          return
        }
        // Guardar el pedido localmente antes de redirigir
        const order = createOrder(items, formData, subtotal, shipping)
        saveOrder(order)
        completePurchase()
        // Redirigir a Mercado Pago
        window.location.href = data.init_point
        return
      } catch (err) {
        setError("Error al conectar con Mercado Pago. Intenta nuevamente.")
        setIsSubmitting(false)
        return
      }
    }

    // Flujo normal para efectivo/transferencia
    const order = createOrder(items, formData, subtotal, shipping)
    saveOrder(order)
    const success = completePurchase()
    if (success) {
      router.push(`/checkout/success?orderId=${order.id}`)
    } else {
      setError("No se pudo completar tu pedido. Verifica la disponibilidad e intenta nuevamente.")
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Tu carrito está vacío
        </h1>
        <p className="mt-2 text-muted-foreground">
          Agrega productos antes de continuar.
        </p>
        <Link href="/products">
          <Button className="mt-6">Ver Productos</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-secondary/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/cart"
            className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Carrito
          </Link>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Checkout
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit}>
          <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-8">
            {/* Customer Information */}
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                        Nombre *
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                        Apellido *
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="age" className="text-sm font-medium text-foreground">
                        Edad *
                      </label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="gender" className="text-sm font-medium text-foreground">
                        Género *
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Selecciona</option>
                        <option value="masculino">Masculino</option>
                        <option value="femenino">Femenino</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dni" className="text-sm font-medium text-foreground">
                      DNI *
                    </label>
                    <Input
                      id="dni"
                      name="dni"
                      value={formData.dni}
                      onChange={handleChange}
                      placeholder="Ej: 12345678"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">
                      Número de Teléfono *
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Correo Electrónico *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Dirección de Envío</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium text-foreground">
                      Dirección *
                    </label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium text-foreground">
                        Ciudad *
                      </label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="postalCode" className="text-sm font-medium text-foreground">
                        Código Postal *
                      </label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-sm font-medium text-foreground">
                      Notas (Opcional)
                    </label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Instrucciones especiales para tu pedido..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Método de Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Efectivo */}
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodSelect("efectivo")}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                      paymentMethod === "efectivo"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Efectivo</h3>
                        <p className="text-sm text-muted-foreground">
                          Paga en efectivo al recibir tu pedido
                        </p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "efectivo"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {paymentMethod === "efectivo" && (
                          <div className="h-2 w-2 bg-primary-foreground rounded-full" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Tarjeta de Crédito/Débito */}
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodSelect("tarjeta")}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                      paymentMethod === "tarjeta"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Tarjeta de Crédito/Débito</h3>
                        <p className="text-sm text-muted-foreground">
                          Paga con Mercado Pago de forma segura
                        </p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "tarjeta"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {paymentMethod === "tarjeta" && (
                          <div className="h-2 w-2 bg-primary-foreground rounded-full" />
                        )}
                      </div>
                    </div>
                  </button>

                  {paymentMethod === "tarjeta" && (
                    <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Serás redirigido a Mercado Pago para completar el pago de forma segura.
                      </p>
                      <div className="bg-background rounded p-3 text-center">
                        <p className="text-sm font-semibold text-foreground">Total a pagar</p>
                        <p className="text-2xl font-bold text-primary">${total.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {/* Transferencia */}
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodSelect("transferencia")}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-colors ${
                      paymentMethod === "transferencia"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Transferencia Bancaria</h3>
                        <p className="text-sm text-muted-foreground">
                          Transferencia o depósito bancario
                        </p>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "transferencia"
                            ? "border-primary bg-primary"
                            : "border-muted-foreground"
                        }`}
                      >
                        {paymentMethod === "transferencia" && (
                          <div className="h-2 w-2 bg-primary-foreground rounded-full" />
                        )}
                      </div>
                    </div>
                  </button>

                  {paymentMethod === "transferencia" && (
                    <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-4">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Información de Transferencia</h4>
                        
                        <div className="space-y-3">
                          <div className="bg-background rounded p-3">
                            <p className="text-xs text-muted-foreground mb-1">Banco</p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-mono font-semibold text-foreground">Banco Privado</p>
                              <button
                                type="button"
                                onClick={() => copyToClipboard("Banco Privado", "bank")}
                                className="p-1 hover:bg-secondary rounded"
                                title="Copiar"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="bg-background rounded p-3">
                            <p className="text-xs text-muted-foreground mb-1">CBU</p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-mono font-semibold text-foreground text-sm">0150000000000000000000</p>
                              <button
                                type="button"
                                onClick={() => copyToClipboard("0150000000000000000000", "cbu")}
                                className="p-1 hover:bg-secondary rounded"
                                title="Copiar"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="bg-background rounded p-3">
                            <p className="text-xs text-muted-foreground mb-1">Alias</p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-mono font-semibold text-foreground">mate.store</p>
                              <button
                                type="button"
                                onClick={() => copyToClipboard("mate.store", "alias")}
                                className="p-1 hover:bg-secondary rounded"
                                title="Copiar"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-700 dark:text-yellow-300">
                          <p className="font-semibold mb-1">Importante:</p>
                          <p>Por favor, realiza la transferencia y confirma tu pedido. Te contactaremos para confirmar que recibimos el pago.</p>
                        </div>
                      </div>

                      {copiedText && (
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                          ✓ {copiedText} copiado
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="mt-8 lg:mt-0">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {items.map((item) => {
                      const currentProduct = products.find((p) => p.id === item.product.id)
                      const hasStockIssue =
                        !currentProduct || currentProduct.stock < item.quantity

                      return (
                        <div
                          key={item.product.id}
                          className={`flex gap-3 ${hasStockIssue ? "opacity-60" : ""}`}
                        >
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground line-clamp-1">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Cant: {item.quantity}
                            </p>
                            {hasStockIssue && (
                              <p className="text-xs text-destructive">
                                Stock insuficiente
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-medium">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Envío</span>
                      <span>{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={isSubmitting || stockIssues.length > 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Completar Pedido
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Al completar tu pedido, aceptas nuestros términos de servicio.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
