"use client";
import dynamic from "next/dynamic"
import Link from "next/link"
import { Home, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

const OrderDetails = dynamic(() => import("./OrderDetails"), { ssr: false })


function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const emailWarning = searchParams.get("emailWarning") === "1";
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {emailWarning && (
          <div className="mx-auto mb-6 max-w-2xl rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
            Tu pedido se registró correctamente, pero no pudimos enviar el correo
            interno de aviso. No te preocupes: el pedido igual quedó guardado y se
            envió por WhatsApp.
          </div>
        )}
        {orderId ? (
          <OrderDetails orderId={orderId} />
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <h1 className="font-serif text-2xl font-bold text-foreground">¡Pedido Confirmado!</h1>
                <p className="mt-3 text-muted-foreground">
                  ¡Gracias por tu compra! Recibirás un mensaje de confirmación por WhatsApp.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
