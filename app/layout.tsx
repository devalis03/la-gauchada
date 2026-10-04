import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'La Gauchada | Yerba Mate Premium y Accesorios',
  description: 'Descubre auténtica yerba mate sudamericana, calabazas tradicionales, termos, bombillas y accesorios. Vive el ritual perfecto del mate.',
  keywords: ['yerba mate', 'calabaza mate', 'bombilla', 'termo', 'mate argentino', 'mate sudamericano'],
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#4a7c59',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
