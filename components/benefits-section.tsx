import { Truck, Shield, Leaf, Heart } from "lucide-react"

const benefits = [
  {
    icon: Leaf,
    title: "100% Natural",
    description: "Toda nuestra yerba mate proviene de granjas sostenibles sin aditivos artificiales.",
  },
  {
    icon: Truck,
    title: "Envío Rápido",
    description: "Entrega rápida a tu puerta. Ordena hoy, disfruta tu mate pronto.",
  },
  {
    icon: Shield,
    title: "Calidad Garantizada",
    description: "Respaldamos todos nuestros productos. ¿No estás satisfecho? Lo arreglamos.",
  },
  {
    icon: Heart,
    title: "Negocio Familiar",
    description: "Somos amantes del mate compartiendo nuestra cultura con el mundo.",
  },
]

export function BenefitsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <benefit.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
