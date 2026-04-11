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
              src="/images/about-intro.jpg"
              alt="La Gauchada - Compartiendo mate"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Más que una Bebida, es un Ritual
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              En La Gauchada, creemos que el mate es más que una simple bebida—es un momento 
              de conexión, una pausa en tu día ajetreado, y un vínculo con siglos de tradición sudamericana.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Fundada por una familia con raíces en Argentina, estamos en una misión de compartir 
              la experiencia auténtica del mate con todos. Desde nuestra yerba cuidadosamente seleccionada 
              hasta nuestras calabazas artesanales, cada producto cuenta una historia.
            </p>
            <Link href="/about">
              <Button variant="outline" className="mt-6">
                Lee Nuestra Historia
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
