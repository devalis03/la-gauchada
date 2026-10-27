import Image from "next/image"
import Link from "next/link"
import { Mail, Phone, MapPin, Instagram, MessageCircle } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-100 md:h-125">
        <Image
          src="/images/about-us.jpg"
          alt="La Gauchada Mates y sus productos con identidad argentina"
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
              Somos dos amigos con una idea simple: compartir eso que sentimos cada vez que tomamos un mate.
            </p>
            <p className="mt-6 leading-relaxed text-center">
              Creemos que cada mate tiene algo de casa, de familia, de amigos y de nuestras raíces. Esa tradición argentina que queremos cuidar y mantener viva.
            </p>
            <p className="mt-6 leading-relaxed text-center">
              La Gauchada Mates nace de ahí: del amor por lo nuestro y de las ganas de acercarte productos que te conecten con lo que realmente importa.
            </p>
            <p className="mt-6 leading-relaxed text-center">
              No buscamos solamente vender mates, sino compartir una forma de vivir nuestras costumbres y mantenerlas presentes.
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
              Las personas apasionadas detrás de La Gauchada Mates
            </p>
          </div>

          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-16">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-xl overflow-hidden rounded-lg">
              <Image
                src="/images/aboutUs.jpeg"
                alt="Los fundadores de La Gauchada Mates compartiendo un mate"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
            <Card className="border-primary/15 bg-background/80">
              <CardContent className="p-6 sm:p-8">
                <h3 className="mt-3 font-serif text-2xl font-semibold text-foreground md:text-3xl">
                  ¿Quiénes somos?
                </h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Somos <strong>Pedro Cabrera y René Goane, ingenieros industriales y fundadores de La Gauchada</strong>, un emprendimiento tucumano nacido de nuestra pasión por el mate y las tradiciones argentinas.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Buscamos ofrecer productos de calidad, combinando tradición, personalización y cercanía con nuestros clientes.
                </p>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  <em>La Gauchada — Pequeños mates, grandes momentos.</em>
                </p>
              </CardContent>
            </Card>
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
                  <a
                    href="https://wa.me/5493815764026?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20los%20productos%20de%20La%20Gauchada%20Mates."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    aria-label="WhatsApp"
                  >
                    <FaWhatsapp className="h-5 w-5" />
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
