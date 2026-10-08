"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Check, Maximize2, Minus, Plus, ShoppingCart, Upload } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { ENGRAVING_PRICE, getRecommendedPrice, hasMateInCart, MATE_BOMBILLA_PROMO_PRICE, PICO_DE_ORO_ID } from "@/lib/cart-pricing"
import { getProductColorClass } from "@/lib/product-colors"
import { formatProductColor, type EngravingOptions, type Product, type ProductColor } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

const ENGRAVING_CATEGORIES = new Set<Product["category"]>(["mates", "yerberos", "termos", "bombillas"])

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener("load", () => resolve(String(reader.result)))
    reader.addEventListener("error", () => reject(new Error("No se pudo leer la imagen")))
    reader.readAsDataURL(file)
  })
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { items, products, addToCart } = useCart()
  const product = products.find((item) => item.id === params?.id)
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(product?.colors?.[0])
  const [bundleSelections, setBundleSelections] = useState<Record<string, ProductColor>>({})
  const [engravingEnabled, setEngravingEnabled] = useState(false)
  const [engravingText, setEngravingText] = useState("")
  const [engravingImage, setEngravingImage] = useState<string | undefined>()
  const [engravingError, setEngravingError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [includeBombilla, setIncludeBombilla] = useState(false)
  const [bombillaEngravingEnabled, setBombillaEngravingEnabled] = useState(false)
  const [bombillaEngravingText, setBombillaEngravingText] = useState("")
  const [bombillaEngravingImage, setBombillaEngravingImage] = useState<string | undefined>()
  const [bombillaEngravingError, setBombillaEngravingError] = useState<string | null>(null)
  const [addError, setAddError] = useState<string | null>(null)
  const [isAdded, setIsAdded] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryImage, setGalleryImage] = useState(product?.image ?? "")

  const bundleProducts = useMemo(() => product?.bundle?.components.map((component) => ({
    component,
    product: products.find((item) => item.id === component.productId),
  })).filter((item): item is { component: { productId: string; quantity: number }; product: Product } => Boolean(item.product)) ?? [], [product, products])

  useEffect(() => {
    if (!product) return
    setSelectedColor(product.colors?.[0])
    setGalleryImage(product.image)
    setQuantity(1)
    setIncludeBombilla(false)
    setBombillaEngravingEnabled(false)
    setBombillaEngravingText("")
    setBombillaEngravingImage(undefined)
    setAddError(null)
    const initialSelections = Object.fromEntries(
      (product.bundle?.components ?? []).flatMap((component) => {
        const componentProduct = products.find((item) => item.id === component.productId)
        const color = componentProduct?.colors?.[0]
        return color ? [[component.productId, color]] : []
      })
    )
    setBundleSelections(initialSelections)
  }, [product, products])

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <h1 className="font-serif text-2xl font-bold">Producto no encontrado</h1>
        <p className="mt-2 text-muted-foreground">Puede que el producto ya no esté disponible.</p>
        <Link href="/products"><Button className="mt-6">Volver al catálogo</Button></Link>
      </div>
    )
  }

  const displayImage = selectedColor ? product.colorImages?.[selectedColor] ?? product.image : product.image
  const galleryImages = Array.from(new Set([product.image, ...Object.values(product.colorImages ?? {})]))
  const canEngrave = ENGRAVING_CATEGORIES.has(product.category)
  const isMate = product.category === "mates"
  const picoDeLoro = products.find((item) => item.id === PICO_DE_ORO_ID)
  const hasMate = hasMateInCart(items)
  const priceOverride = product.id === PICO_DE_ORO_ID && hasMate
    ? getRecommendedPrice(product, items)
    : undefined
  const displayPrice = priceOverride ?? product.price
  const colorComponents = bundleProducts.filter(({ product: componentProduct }) => (componentProduct.colors?.length ?? 0) > 1)
  const hasRequiredPromoColors = colorComponents.every(({ component }) => Boolean(bundleSelections[component.productId]))
  const engraving: EngravingOptions | undefined = engravingEnabled
    ? { text: engravingText.trim() || undefined, image: engravingImage }
    : undefined
  const bombillaEngraving: EngravingOptions | undefined = bombillaEngravingEnabled
    ? { text: bombillaEngravingText.trim() || undefined, image: bombillaEngravingImage }
    : undefined
  const isOutOfStock = product.stock === 0

  const handleEngravingFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/") || file.size > 1_500_000) {
      setEngravingError("Elegí una imagen de hasta 1,5 MB.")
      return
    }
    try {
      setEngravingImage(await fileToDataUrl(file))
      setEngravingError(null)
    } catch {
      setEngravingError("No se pudo cargar la imagen.")
    }
  }

  const handleBombillaEngravingFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/") || file.size > 1_500_000) {
      setBombillaEngravingError("Elegí una imagen de hasta 1,5 MB.")
      return
    }
    try {
      setBombillaEngravingImage(await fileToDataUrl(file))
      setBombillaEngravingError(null)
    } catch {
      setBombillaEngravingError("No se pudo cargar la imagen.")
    }
  }

  const handleAddToCart = () => {
    setAddError(null)
    if (engravingEnabled && !engraving?.text && !engraving?.image) {
      setEngravingError("Escribí un texto o adjuntá una imagen para el grabado.")
      return
    }
    if (includeBombilla && !picoDeLoro) {
      setAddError("La bombilla promocional no está disponible en este momento.")
      return
    }
    if (includeBombilla && bombillaEngravingEnabled && !bombillaEngraving?.text && !bombillaEngraving?.image) {
      setBombillaEngravingError("Escribí un texto o adjuntá una imagen para el grabado de la bombilla.")
      return
    }
    const availableProductStock = product.stock - items
      .filter((item) => item.product.id === product.id)
      .reduce((total, item) => total + item.quantity, 0)
    const availableBombillaStock = picoDeLoro
      ? picoDeLoro.stock - items.filter((item) => item.product.id === picoDeLoro.id).reduce((total, item) => total + item.quantity, 0)
      : 0
    if (quantity > availableProductStock || (includeBombilla && quantity > availableBombillaStock)) {
      setAddError("No hay stock suficiente para la cantidad seleccionada.")
      return
    }

    const success = addToCart(product, quantity, selectedColor, priceOverride, {
      bundleSelections: product.category === "promos" ? bundleSelections : undefined,
      engraving: canEngrave ? engraving : undefined,
    })
    if (!success) return
    if (includeBombilla && picoDeLoro) {
      const bombillaAdded = addToCart(picoDeLoro, quantity, undefined, MATE_BOMBILLA_PROMO_PRICE, {
        engraving: bombillaEngraving,
      })
      if (!bombillaAdded) {
        setAddError("El producto se agregó, pero no pudimos agregar la bombilla promocional.")
        return
      }
    }
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2200)
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
          <section>
            <button type="button" className="group relative block aspect-square w-full overflow-hidden rounded-xl bg-muted text-left" onClick={() => { setGalleryImage(displayImage); setGalleryOpen(true) }} aria-label="Ver imagen en pantalla completa">
              <Image src={displayImage} alt={product.name} fill priority className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" sizes="(max-width: 1024px) 100vw, 55vw" />
              <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-md bg-background/90 px-3 py-2 text-sm font-medium shadow-sm"><Maximize2 className="h-4 w-4" /> Ampliar</span>
            </button>
            {galleryImages.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {galleryImages.map((image) => (
                  <button key={image} type="button" className={`relative aspect-square overflow-hidden rounded-md border-2 ${galleryImage === image ? "border-primary" : "border-transparent"}`} onClick={() => { setGalleryImage(image); if (image !== product.image) setSelectedColor(Object.entries(product.colorImages ?? {}).find(([, url]) => url === image)?.[0]) }} aria-label="Seleccionar imagen">
                    <Image src={image} alt="" fill className="object-cover" sizes="120px" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">{product.category === "promos" ? "Promo" : "La Gauchada Mates"}</p>
              <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">{product.name}</h1>
              <div className="mt-4 flex items-baseline gap-3">
                <p className="text-3xl font-semibold text-foreground">{formatPrice(displayPrice)}</p>
                {priceOverride !== undefined && <span className="text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>}
              </div>
              {priceOverride !== undefined && <p className="mt-1 text-sm font-medium text-primary">Precio promocional por tener un mate en tu carrito</p>}
              <p className="mt-4 whitespace-pre-line text-muted-foreground">{product.description}</p>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="border-t border-border pt-5">
                <h2 className="font-semibold">Elegí el color</h2>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button key={color} type="button" onClick={() => { setSelectedColor(color); setGalleryImage(product.colorImages?.[color] ?? product.image) }} className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${selectedColor === color ? "border-primary ring-2 ring-primary/20" : "border-border"}`} aria-pressed={selectedColor === color}>
                      <span className={`h-5 w-5 rounded-sm border ${getProductColorClass(color)}`} />
                      {formatProductColor(color)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.category === "promos" && bundleProducts.length > 0 && (
              <Card className="border-border py-0">
                <CardContent className="space-y-4 p-5">
                  <div>
                    <h2 className="font-semibold">Elegí las opciones de tu promo</h2>
                    <p className="mt-1 text-sm text-muted-foreground">La promo incluye estos productos:</p>
                  </div>
                  {bundleProducts.map(({ component, product: componentProduct }) => (
                    <div key={component.productId} className="border-t border-border pt-3">
                      <p className="text-sm font-medium">{component.quantity > 1 ? `${component.quantity} × ` : ""}{componentProduct.name}</p>
                      {(componentProduct.colors?.length ?? 0) > 1 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {componentProduct.colors?.map((color) => (
                            <button key={color} type="button" onClick={() => setBundleSelections((previous) => ({ ...previous, [component.productId]: color }))} className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs ${bundleSelections[component.productId] === color ? "border-primary ring-2 ring-primary/20" : "border-border"}`} aria-pressed={bundleSelections[component.productId] === color}>
                              <span className={`h-4 w-4 rounded-sm border ${getProductColorClass(color)}`} />
                              {formatProductColor(color)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {canEngrave && (
              <div className="border-t border-border pt-5">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={engravingEnabled} onChange={(event) => { setEngravingEnabled(event.target.checked); setEngravingError(null) }} className="mt-1 h-4 w-4 accent-primary" />
                  <span><span className="font-semibold">Quiero agregar un grabado</span><span className="block text-sm text-muted-foreground">Personalizalo por {formatPrice(ENGRAVING_PRICE)}</span></span>
                </label>
                {engravingEnabled && (
                  <div className="mt-4 space-y-3 rounded-md bg-secondary/50 p-4">
                    <Textarea value={engravingText} onChange={(event) => setEngravingText(event.target.value.slice(0, 200))} placeholder="Texto para grabar" maxLength={200} />
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium"><Upload className="h-4 w-4" /> Adjuntar referencia
                      <Input type="file" accept="image/*" onChange={handleEngravingFile} className="sr-only" />
                    </label>
                    {engravingImage && <p className="text-xs text-primary">Imagen adjunta correctamente.</p>}
                    {engravingError && <p className="text-sm text-destructive">{engravingError}</p>}
                  </div>
                )}
              </div>
            )}

            {isMate && picoDeLoro && (
              <div className="border-t border-border pt-5">
                <h2 className="font-semibold">¿Querés incluir una bombilla?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Pico de Loro a {formatPrice(MATE_BOMBILLA_PROMO_PRICE)} junto con tu mate.</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm ${!includeBombilla ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                    <input type="radio" name="bombilla-option" checked={!includeBombilla} onChange={() => { setIncludeBombilla(false); setBombillaEngravingEnabled(false) }} />
                    No incluir bombilla
                  </label>
                  <label className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm ${includeBombilla ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
                    <input type="radio" name="bombilla-option" checked={includeBombilla} onChange={() => setIncludeBombilla(true)} />
                    Incluir bombilla
                  </label>
                </div>
                {includeBombilla && (
                  <div className="mt-4 rounded-md bg-secondary/50 p-4">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input type="checkbox" checked={bombillaEngravingEnabled} onChange={(event) => { setBombillaEngravingEnabled(event.target.checked); setBombillaEngravingError(null) }} className="mt-1 h-4 w-4 accent-primary" />
                      <span><span className="font-semibold">Agregar grabado a la bombilla</span><span className="block text-sm text-muted-foreground">Personalizala por {formatPrice(ENGRAVING_PRICE)}</span></span>
                    </label>
                    {bombillaEngravingEnabled && (
                      <div className="mt-4 space-y-3">
                        <Textarea value={bombillaEngravingText} onChange={(event) => setBombillaEngravingText(event.target.value.slice(0, 200))} placeholder="Texto para grabar en la bombilla" maxLength={200} />
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium"><Upload className="h-4 w-4" /> Adjuntar referencia
                          <Input type="file" accept="image/*" onChange={handleBombillaEngravingFile} className="sr-only" />
                        </label>
                        {bombillaEngravingImage && <p className="text-xs text-primary">Imagen adjunta correctamente.</p>}
                        {bombillaEngravingError && <p className="text-sm text-destructive">{bombillaEngravingError}</p>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-border pt-5">
              <p className="text-sm text-muted-foreground">Medios de pago: efectivo, transferencia bancaria o tarjeta mediante Mercado Pago.</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-11 items-center rounded-md border border-input bg-background">
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-r-none" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} aria-label="Disminuir cantidad">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-10 text-center text-sm font-semibold" aria-label={`Cantidad: ${quantity}`}>{quantity}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 rounded-l-none" onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))} disabled={quantity >= product.stock} aria-label="Aumentar cantidad">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button className="flex-1 gap-2" size="lg" disabled={isOutOfStock || isAdded || !hasRequiredPromoColors} onClick={handleAddToCart}>
                {isOutOfStock ? "Agotado" : isAdded ? <><Check className="h-4 w-4" /> Agregado al carrito</> : <><ShoppingCart className="h-4 w-4" /> Agregar al carrito</>}
                </Button>
              </div>
              {addError && <p className="mt-2 text-sm text-destructive">{addError}</p>}
              {isOutOfStock && <p className="mt-2 text-sm text-destructive">Este producto no tiene stock disponible.</p>}
            </div>
          </section>
        </div>
      </div>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-5xl border-0 bg-black/95 p-3" aria-describedby="gallery-description">
          <DialogTitle className="sr-only">Imagen de {product.name}</DialogTitle>
          <DialogDescription id="gallery-description" className="sr-only">Vista ampliada del producto</DialogDescription>
          <div className="relative aspect-square w-full sm:aspect-[4/3]"><Image src={galleryImage} alt={product.name} fill className="object-contain" sizes="90vw" /></div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
