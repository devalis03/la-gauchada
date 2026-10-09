import { Truck, ShieldCheck, Flag, PenLine } from "lucide-react"

const benefits = [
  {
    icon: Flag,
    title: "Tradición Argentina",
    description: "Productos elegidos para mantener viva nuestra forma de compartir el mate.",
  },
  {
    icon: Truck,
    title: "Envíos a todo el país",
    description: "Preparamos cada pedido con cuidado para que La Gauchada Mates llegue estés donde estés.",
  },
  {
    icon: ShieldCheck,
    title: "Calidad Seleccionada",
    description: "Elegimos cada producto cuidando sus materiales, terminaciones y durabilidad.",
  },
  {
    icon: PenLine,
    title: "Personalización",
    description: "Grabamos nombres, iniciales, fechas y diseños para hacer cada mate único.",
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
