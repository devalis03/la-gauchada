import Link from "next/link"
import { Instagram } from "lucide-react"
import Image from "next/image"

const navigation = {
  shop: [
    { name: "Todos los Productos", href: "/products" },
    { name: "Mates", href: "/products?category=mates" },
    { name: "Termos", href: "/products?category=termos" },
    { name: "Bombillas", href: "/products?category=bombillas" },
  ],
  company: [
    { name: "Sobre Nosotros", href: "/about" },
    { name: "Contacto", href: "/about#contact" },
  ],
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="La Gauchada" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
              <span className="text-xl font-semibold tracking-tight text-foreground">
                La Gauchada
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Traemos la experiencia auténtica del mate sudamericano a tu hogar. 
              Yerba mate premium, calabazas tradicionales y todos los accesorios que necesitas 
              para el ritual perfecto del mate.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://www.instagram.com/lagauchada.mates?igsh=b2pxbjVxMG16emQ5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Tienda
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.shop.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Empresa
            </h3>
            <ul className="mt-4 space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} La Gauchada. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
