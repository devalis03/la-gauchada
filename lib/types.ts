export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: Category
  subcategory?: SubcategoryId
  stock: number
  featured?: boolean
  active?: boolean
  colors?: ProductColor[]
  colorImages?: Record<string, string>
  colorHexes?: Record<string, string>
  bundle?: ProductBundle
}

export type Category = string

export interface CategoryDefinition {
  id: Category
  name: string
  description: string
  image: string
  active: boolean
}

export type ProductColor = string
export function formatProductColor(color: ProductColor) {
  const labels: Record<string, string> = {
    marron: "Marrón",
    negro: "Negro",
    blanco: "Blanco",
    rojo: "Rojo",
    borravino: "Borravino",
    bordo: "Bordó",
    azul: "Azul",
    "azul claro": "Azul claro",
    "azul oscuro": "Azul oscuro",
    celeste: "Celeste",
    verde: "Verde",
    "verde claro": "Verde claro",
    "verde oscuro": "Verde oscuro",
    amarillo: "Amarillo",
    naranja: "Naranja",
    rosa: "Rosa",
    violeta: "Violeta",
    morado: "Morado",
    lila: "Lila",
    gris: "Gris",
    beige: "Beige",
    crema: "Crema",
    dorado: "Dorado",
    plateado: "Plateado",
    turquesa: "Turquesa",
    terracota: "Terracota",
    natural: "Natural",
  }
  const normalized = color.trim().toLowerCase()
  return labels[normalized] ?? normalized.replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export type SubcategoryId = "cuero-crudo" | "tradicionales" | "algarrobo" | "criollos"

export interface Subcategory {
  id: SubcategoryId
  name: string
  category: "mates"
}

export interface CartItem {
  product: Product
  quantity: number
  stockItems?: StockItem[]
  selectedColor?: ProductColor
  priceOverride?: number
  bundleSelections?: Record<string, ProductColor>
  bundleComponentNames?: Record<string, string>
  engraving?: EngravingOptions
}

export interface EngravingOptions {
  text?: string
  image?: string
}

export interface StockItem {
  productId: string
  quantity: number
}

export interface ProductBundle {
  productId: string
  components: { productId: string; quantity: number }[]
}

export interface CustomerInfo {
  firstName: string
  lastName: string
  age: string
  gender: string
  dni: string
  phone: string
  email: string
  address: string
  city: string
  postalCode: string
  notes?: string
  paymentMethod: "efectivo" | "tarjeta" | "transferencia"
}

export interface Order {
  id: string
  items: CartItem[]
  customer: CustomerInfo
  total: number
  subtotal: number
  shipping: number
  createdAt: string
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  paymentMethod: "efectivo" | "tarjeta" | "transferencia"
  transferenceStatus?: "pendiente" | "confirmado" | "rechazado"
  paymentStatus?: "pending" | "approved" | "rejected" | "in_process" | "cancelled"
  paymentId?: string
  externalReference?: string
  stockRestored?: boolean
  reservationExpiresAt?: string
}

export interface OrderNotification {
  orderId: string
  customerEmail: string
  customerName: string
  status: "pending" | "sent" | "failed"
  sentAt?: string
}

export const CATEGORIES: CategoryDefinition[] = [
  { id: "promos", name: "Promos", description: "Ofertas y paquetes especiales", image: "/images/Promos.jpg", active: true },
  { id: "mates", name: "Mates", description: "Todos los mates", image: "/images/Mates.jpg", active: true },
  { id: "materas", name: "Materas", description: "Bolsas para llevar", image: "/images/Materas.jpg", active: true },
  { id: "yerberos", name: "Yerberos", description: "Contenedores de yerba", image: "/images/Yerberos.jpg", active: true },
  { id: "cuchillos-tablas", name: "Cuchillos y Tablas", description: "Cuchillos y tablas para compartir", image: "/images/Cuchillos.jpg", active: true },
  { id: "ponchos", name: "Ponchos", description: "Ponchos tradicionales", image: "/images/Ponchos.jpg", active: true },
  { id: "sombreros-boinas", name: "Sombreros y Boinas", description: "Sombreros y boinas tradicionales", image: "/images/Boinas.jpg", active: true },
  { id: "termos", name: "Termos", description: "Termos para agua caliente", image: "/images/Termo.jpg", active: true },
  { id: "bombillas", name: "Bombillas", description: "Bombillas", image: "/images/Bombillas.jpg", active: true },
  { id: "otros", name: "Otros", description: "Otros accesorios", image: "/images/cepillo-bombilla.jpg", active: true },
]

export const SUBCATEGORIES: Subcategory[] = [
  { id: "cuero-crudo", name: "Cuero Crudo", category: "mates" },
  { id: "tradicionales", name: "Tradicionales", category: "mates" },
  { id: "algarrobo", name: "Algarrobo", category: "mates" },
  { id: "criollos", name: "Criollos", category: "mates" },
]
