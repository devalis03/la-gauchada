import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function AboutIntro() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            <Image
              src="/images/inicio-about.jpg"
              alt="Productos con identidad argentina de La Gauchada"
              fill
              className="object-cover object-[center_70%]"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Productos con identidad argentina
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Mates, accesorios para el asado, cuero, madera e indumentaria gaucha, elegidos para acompañar nuestras costumbres de siempre.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Desde Tucumán, acercamos una selección de productos que mantienen vivo lo nuestro.
            </p>
            <Link href="/about">
              <Button variant="outline" className="mt-6">
                Conoce nuestra historia
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
