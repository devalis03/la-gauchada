"use client";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getOrderById } from "@/lib/order-service";
import type { Order } from "@/lib/types";

export default function OrderDetails({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadOrder() {
      try {
        const loadedOrder = await getOrderById(orderId)
        if (mounted) {
          setOrder(loadedOrder)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrder()

    return () => {
      mounted = false
    }
  }, [orderId])

  useEffect(() => {
    if (order) {
      const whatsappNumber = "+5493815764026";
      const whatsappMsg = encodeURIComponent(
        `Hola, acabo de hacer una compra en la web. Mi número de pedido es ${order.id}.\nNombre: ${order.customer.firstName} ${order.customer.lastName}\nTeléfono: ${order.customer.phone}\nEmail: ${order.customer.email}\nDirección: ${order.customer.address}, ${order.customer.city}, ${order.customer.postalCode}\nTotal: $${order.total.toFixed(2)}`
      );
      const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`;
      window.open(whatsappLink, "_blank");
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="max-w-2xl w-full mx-auto">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <h1 className="font-serif text-2xl font-bold text-foreground">Cargando pedido...</h1>
          </CardContent>
        </Card>
      </div>
    )
  }

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
              Recibirás un mensaje de confirmación por WhatsApp o email.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isTransference = order.paymentMethod === "transferencia";
  const isConfirmed = order.transferenceStatus === "confirmado";
  const isCardPayment = order.paymentMethod === "tarjeta";
  const isCardApproved = order.paymentStatus === "approved";

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
              <h1 className="font-serif text-2xl font-bold text-foreground">
                {isCardPayment && !isCardApproved ? "Pedido recibido" : "¡Pedido Confirmado!"}
              </h1>
              <p className="text-muted-foreground mt-2">Número de pedido: <span className="font-mono font-semibold">{order.id}</span></p>
            </div>
            <p className="text-foreground text-lg">
              Hemos recibido tu pedido por un total de <strong>${order.total.toFixed(2)}</strong>
            </p>
            {isCardPayment && !isCardApproved && (
              <p className="text-sm text-muted-foreground">
                Estamos esperando la confirmación del pago de Mercado Pago.
              </p>
            )}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4"
              tabIndex={-1}
            >
              <Button variant="whatsapp">
                Contactar por WhatsApp
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
      {/* Bank Transfer Status */}
      {isTransference && (
        <Card className={isConfirmed ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className={`h-6 w-6 shrink-0 ${isConfirmed ? "text-green-600" : "text-yellow-600"}`} />
              <div>
                <h3 className={`font-semibold ${isConfirmed ? "text-green-900" : "text-yellow-900"}`}>{isConfirmed ? "✓ Transferencia Confirmada" : "⏳ Transferencia Pendiente de Verificación"}</h3>
                <p className={`mt-2 text-sm ${isConfirmed ? "text-green-800" : "text-yellow-800"}`}>
                  {isConfirmed
                    ? "Tu transferencia ha sido confirmada. Tu pedido será procesado inmediatamente."
                    : "Hemos recibido tu solicitud de transferencia. Por favor completa la transferencia bancaria. Una vez que verifiquemos el pago, te contactaremos por WhatsApp o email."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
