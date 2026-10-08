"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    id: 1,
    title: "Pequeños mates, grandes momentos",
    subtitle: "Tradición argentina para compartir todos los días.",
    image: "/images/hero-1.jpg",
    cta: { text: "Ver Mates", href: "/products?category=mates" },
  },
  {
    id: 2,
    title: "Un mate hecho para vos.",
    subtitle: "Personalizamos nombres, iniciales, fechas, logos y diseños.",
    image: "/images/hero-2.jpg",
    cta: { text: "Personalizar el mío", href: "/products?category=otros" },
  },
  {
    id: 3,
    title: "El regalo que siempre funciona",
    subtitle: "Combos materos listos para regalar y compartir.",
    image: "/images/hero-3.jpg",
    cta: { text: "Ver Promos", href: "/products?category=promos" },
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
    const timer = setInterval(next, 10000)
    return () => clearInterval(timer)
  }, [current, next])

  return (
    <section className="relative h-[500px] overflow-hidden bg-muted md:h-[600px] lg:h-[700px]">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={index !== current}
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
