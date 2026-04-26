import Image from "next/image"
import Link from "next/link"
import { Mail, Phone, MapPin, Instagram, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const owners = [
  {
    name: "Pedro Cabrera",
    role: "Co-Fundador",
    image: "/images/owner-1.jpg",
    bio: "Nacido en Misiones, Argentina, Carlos creció rodeado de plantaciones de yerba mate. Su pasión por compartir la cultura del mate lo llevó a fundar La Gauchada.",
  },
  {
    name: "Rene Goane",
    role: "Co-Fundador",
    image: "/images/owner-2.jpg",
    bio: "María aporta su experiencia en artesanías para seleccionar nuestra colección de calabazas y accesorios. Cree que cada momento de mate debe ser especial.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-100 md:h-125">
        <Image
          src="/images/about-story.jpg"
          alt="Plantación de yerba mate"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-white md:text-5xl">
              Nuestra Historia
            </h1>
            {/* <p className="mt-4 text-lg text-white/90">
              Una pasión familiar por compartir la auténtica cultura del mate con el mundo
            </p> */}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg mx-auto text-muted-foreground">
            <p className="text-lg leading-relaxed text-center">
              Somos dos amigos con una idea simple: compartir lo que sentimos cada vez que tomamos un mate.
            </p>
            <p className="mt-6 leading-relaxed text-center">
              Creemos que cada mate tiene su historia: un poco de casa, de familia, de amigos y de nuestras raíces. Esa tradición Argentina que queremos cuidar y mantener viva.
            </p>
            <p className="mt-6 leading-relaxed text-center">
              No buscamos solo vender productos, sino ofrecer momentos. Experiencias de nuestra cultura que se disfrutan con el corazón.
            </p>
            <p className="mt-6 leading-relaxed text-center">
              <span className="font-semibold text-foreground">La Gauchada Mates</span> nace desde ahí: del amor por lo simple y de las ganas de que cada mate que llegue te conecte con lo que realmente importa.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Conocenos Mejor
            </h2>
            <p className="mt-3 text-muted-foreground">
              Las personas apasionadas detrás de La Gauchada
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:max-w-4xl lg:mx-auto">
            {owners.map((owner) => (
              <Card key={owner.name} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={owner.image}
                    alt={owner.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-semibold text-foreground">
                    {owner.name}
                  </h3>
                  <p className="text-sm text-primary">{owner.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {owner.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Ponte en Contacto
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                ¿Tienes preguntas sobre nuestros productos o necesitas ayuda con tu pedido? 
                Siempre estamos felices de ayudar. Contáctanos a través de cualquiera de estos canales.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Correo Electrónico</p>
                    <a href="mailto:lagauchadamates@gmail.com" className="font-medium text-foreground hover:text-primary">
                      lagauchadamates@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <a href="tel:+5493815764026" className="font-medium text-foreground hover:text-primary">
                      +54 9 381 576-4026
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-medium text-foreground">
                      Yerba Buena, Tucumán, Argentina
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm font-medium text-foreground">Síguenos</p>
                <div className="mt-3 flex gap-4">
                  <a
                    href="https://www.instagram.com/lagauchada.mates?igsh=b2pxbjVxMG16emQ5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="flex items-center justify-center">
              <Card className="w-full max-w-md bg-primary/5 border-primary/20">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <MessageCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mt-6 font-serif text-xl font-semibold text-foreground">
                    Chatea con Nosotros en WhatsApp
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    ¡La forma más rápida de obtener respuestas! Generalmente respondemos 
                    en minutos durante horario comercial.
                  </p>
                  <a
                    href="https://wa.me/5493815764026?text=Hola! Me interesa conocer más sobre los productos de mate."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="mt-6 gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Iniciar Chat WhatsApp
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
