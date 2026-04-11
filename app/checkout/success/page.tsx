import { Suspense } from "react"
import Link from "next/link"
import { CheckCircle, AlertCircle, Home, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getOrderById } from "@/lib/order-service"

function OrderDetails({ orderId }: { orderId: string }) {
  const order = getOrderById(orderId)

  if (!order) {
    return (
      <div className="max-w-2xl w-full mx-auto">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground">¡Pedido Confirmado!</h1>
            <p className="mt-3 text-muted-foreground">
              Recibirás un correo de confirmación con los detalles de tu pedido.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isTransference = order.paymentMethod === "transferencia"
  const isConfirmed = order.transferenceStatus === "confirmado"

  return (
    <div className="max-w-2xl w-full mx-auto space-y-6">
      {/* Order Confirmation Card */}
      <Card className="overflow-hidden">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>

            <div>
              <h1 className="font-serif text-2xl font-bold text-foreground">¡Pedido Confirmado!</h1>
              <p className="text-muted-foreground mt-2">Número de pedido: <span className="font-mono font-semibold">{order.id}</span></p>
            </div>

            <p className="text-foreground text-lg">
              Hemos recibido tu pedido por un total de <strong>${order.total.toFixed(2)}</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bank Transfer Status */}
      {isTransference && (
        <Card className={isConfirmed ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <AlertCircle
                className={`h-6 w-6 flex-shrink-0 ${isConfirmed ? "text-green-600" : "text-yellow-600"}`}
              />
              <div>
                <h3 className={`font-semibold ${isConfirmed ? "text-green-900" : "text-yellow-900"}`}>
                  {isConfirmed ? "✓ Transferencia Confirmada" : "⏳ Transferencia Pendiente de Verificación"}
                </h3>
                <p className={`mt-2 text-sm ${isConfirmed ? "text-green-800" : "text-yellow-800"}`}>
                  {isConfirmed
                    ? "Tu transferencia ha sido confirmada. Tu pedido será procesado inmediatamente."
                    : "Hemos recibido tu solicitud de transferencia. Por favor completa la transferencia bancaria. Una vez que verifiquemos el pago, te enviaremos un email de confirmación."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Summary */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-semibold text-lg mb-4 text-foreground">Resumen del Pedido</h2>

          <div className="space-y-3 mb-6 pb-6 border-b border-border">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-foreground">{item.product.name}</p>
                  <p className="text-muted-foreground">Cantidad: {item.quantity}</p>
                </div>
                <p className="font-medium text-foreground">${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío:</span>
              <span className="font-medium">{order.shipping === 0 ? "Gratis" : `$${order.shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="font-semibold text-foreground">Total:</span>
              <span className="font-semibold text-primary text-lg">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="font-semibold text-lg mb-4 text-foreground">Información de Envío</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Nombre:</span>{" "}
              <span className="font-medium">
                {order.customer.firstName} {order.customer.lastName}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Dirección:</span>{" "}
              <span className="font-medium">{order.customer.address}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Ciudad:</span>{" "}
              <span className="font-medium">
                {order.customer.city}, {order.customer.postalCode}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Teléfono:</span>{" "}
              <span className="font-medium">{order.customer.phone}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              <span className="font-medium">{order.customer.email}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="bg-secondary/30 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-3">¿Qué sucede ahora?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Recibirás un email de confirmación en tu bandeja de entrada</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Verificaremos tu pedido y disponibilidad</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Te notificaremos cuando tu pedido sea enviado</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            <span>Podrás seguir tu envío con la información que te enviaremos</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string }
}) {
  const orderId = searchParams.orderId

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<p className="text-muted-foreground text-center">Cargando detalles del pedido...</p>}>
          {orderId ? (
            <OrderDetails orderId={orderId} />
          ) : (
            <div className="max-w-2xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-8 pb-8">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                    <CheckCircle className="h-10 w-10 text-primary" />
                  </div>
                  <h1 className="font-serif text-2xl font-bold text-foreground">¡Pedido Confirmado!</h1>
                  <p className="mt-3 text-muted-foreground">
                    ¡Gracias por tu compra! Recibirás un correo de confirmación con los detalles de tu pedido.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </Suspense>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/products">
            <Button variant="outline" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Seguir Comprando
            </Button>
          </Link>
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
