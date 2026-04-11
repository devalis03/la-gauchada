"use client"

import Link from "next/link"
import { useState } from "react"
import { ShoppingCart, Menu, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/lib/cart-context"

const navigation = [
  { name: "Inicio", href: "/" },
  { name: "Productos", href: "/products" },
  { name: "Sobre Nosotros", href: "/about" },
]

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const { getCartCount } = useCart()
  const cartCount = getCartCount()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="La Gauchada" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
          <span className="text-xl font-semibold tracking-tight text-foreground">
            La Gauchada
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Cart & Mobile Menu */}
        <div className="flex items-center gap-2">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Carrito de compras</span>
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px] p-0 flex flex-col">
              {/* Header Section */}
              <div className="border-b border-border bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-6">
                <SheetTitle className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary overflow-hidden">
                    <Image src="/images/logo.png" alt="La Gauchada" width={40} height={40} className="h-10 w-10 object-cover" />
                  </div>
                  <span className="font-serif text-lg font-semibold">La Gauchada</span>
                </SheetTitle>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 space-y-0 p-3">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 ${
                      index === 0 ? "text-foreground hover:bg-primary/10" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                    {item.name}
                  </Link>
                ))}

                {/* Divider */}
                <div className="my-2 h-px bg-border"></div>

                {/* Cart Link */}
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between rounded-lg px-4 py-3 text-base font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                    Carrito
                  </div>
                  {cartCount > 0 && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </nav>

              {/* Footer Section */}
              <div className="border-t border-border bg-secondary/30 px-6 py-4">
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  Auténtica yerba mate sudamericana para el ritual perfecto
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
