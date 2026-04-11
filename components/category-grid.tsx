import Image from "next/image"
import Link from "next/link"
import { CATEGORIES } from "@/lib/types"

const categoryImages: Record<string, string> = {
  "promos": "/images/kit-matero.jpg",
  "mates": "/images/calabaza-natural.jpg",
  "materas": "/images/bolsa-matera.jpg",
  "yerberos": "/images/yerbera-cuero.jpg",
  "termos": "/images/termo-stanley.jpg",
  "bombillas": "/images/bombilla-alpaca.jpg",
  "otros": "/images/cepillo-bombilla.jpg",
}

export function CategoryGrid() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Compra por Categoría
          </h2>
          <p className="mt-3 text-muted-foreground">
            Encuentra todo lo que necesitas para la experiencia perfecta de mate
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg lg:aspect-square"
            >
              <Image
                src={categoryImages[category.id]}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-foreground/30 transition-colors group-hover:bg-foreground/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                <p className="mt-1 text-sm text-white/80">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
