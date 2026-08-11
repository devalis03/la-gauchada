"use client"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Home, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSearchParams } from "next/navigation"

const OrderDetails = dynamic(() => import("./OrderDetails"), { ssr: false })

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  return (
    <>
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
    </>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="max-w-2xl mx-auto">
              <Card className="text-center">
                <CardContent className="pt-8 pb-8">
                  <h1 className="font-serif text-2xl font-bold text-foreground">Procesando tu pedido...</h1>
                </CardContent>
              </Card>
            </div>
          }
        >
          <SuccessContent />
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
