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
}

export type Category = "promos" | "mates" | "materas" | "yerberos" | "cuchillos-tablas" | "ponchos" | "sombreros-boinas" | "termos" | "bombillas" | "otros"

export type ProductColor = string
export function formatProductColor(color: ProductColor) {
  if (color === "marron") return "Marrón"
  if (color === "negro") return "Negro"
  return color
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

export const CATEGORIES: { id: Category; name: string; description: string }[] = [
  { id: "promos", name: "Promos", description: "Ofertas y paquetes especiales" },
  { id: "mates", name: "Mates", description: "Todos los mates" },
  { id: "materas", name: "Materas", description: "Bolsas para llevar" },
  { id: "yerberos", name: "Yerberos", description: "Contenedores de yerba" },
  { id: "cuchillos-tablas", name: "Cuchillos y Tablas", description: "Cuchillos y tablas para compartir" },
  { id: "ponchos", name: "Ponchos", description: "Ponchos tradicionales" },
  { id: "sombreros-boinas", name: "Sombreros y Boinas", description: "Sombreros y boinas tradicionales" },
  { id: "termos", name: "Termos", description: "Termos para agua caliente" },
  { id: "bombillas", name: "Bombillas", description: "Bombillas" },
  { id: "otros", name: "Otros", description: "Otros accesorios" },
]

export const SUBCATEGORIES: Subcategory[] = [
  { id: "cuero-crudo", name: "Cuero Crudo", category: "mates" },
  { id: "tradicionales", name: "Tradicionales", category: "mates" },
  { id: "algarrobo", name: "Algarrobo", category: "mates" },
  { id: "criollos", name: "Criollos", category: "mates" },
]
