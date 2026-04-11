"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    id: 1,
    title: "El Arte del Mate",
    subtitle: "Experimenta la tradición auténtica sudamericana",
    image: "/images/hero-mate.jpg",
    cta: { text: "Comprar Ahora", href: "/products" },
  },
  {
    id: 2,
    title: "Yerba Mate Premium",
    subtitle: "Mezclas cuidadosamente seleccionadas para el sabor perfecto",
    image: "/images/hero-yerba.jpg",
    cta: { text: "Ver Yerbas", href: "/products?category=otros" },
  },
  {
    id: 3,
    title: "Kits de Mate Completos",
    subtitle: "Todo lo que necesitas en un solo paquete",
    image: "/images/hero-kit.jpg",
    cta: { text: "Ver Kits", href: "/products?category=promos" },
  },
]

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <section className="relative h-[500px] overflow-hidden bg-muted md:h-[600px] lg:h-[700px]">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-foreground/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="mx-auto max-w-3xl px-4 text-center">
              <h1 className="font-serif text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl text-balance">
                {slide.title}
              </h1>
              <p className="mt-4 text-lg text-white/90 md:text-xl text-pretty">
                {slide.subtitle}
              </p>
              <Link href={slide.cta.href}>
                <Button size="lg" className="mt-8">
                  {slide.cta.text}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-background/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-background/40"
        aria-label="Diapositiva anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-background/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-background/40"
        aria-label="Siguiente diapositiva"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all ${
              index === current ? "w-8 bg-white" : "w-2 bg-white/50"
            }`}
            aria-label={`Ir a la diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
