"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FeaturedProducts() {
  return (
    <section className="bg-secondary/30 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Productos Destacados
            </h2>
            <p className="mt-2 text-muted-foreground">
              Nuestros artículos más populares, seleccionados para ti
            </p>
          </div>
          <Link href="/products?category=featured">
            <Button variant="outline" className="gap-2">
              Ver Destacados
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  )
}
