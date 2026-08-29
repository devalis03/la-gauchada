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
}

export type Category = "promos" | "mates" | "materas" | "yerberos" | "termos" | "bombillas" | "otros"

export type SubcategoryId = "mates-imperiales" | "mates-tradicionales" | "mates-torpedos"

export interface Subcategory {
  id: SubcategoryId
  name: string
  category: "mates"
}

export interface CartItem {
  product: Product
  quantity: number
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
  status: "pending" | "confirmed" | "shipped" | "delivered"
  paymentMethod: "efectivo" | "tarjeta" | "transferencia"
  transferenceStatus?: "pendiente" | "confirmado" | "rechazado"
  paymentStatus?: "pending" | "approved" | "rejected" | "in_process" | "cancelled"
  paymentId?: string
  externalReference?: string
  stockRestored?: boolean
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
  { id: "termos", name: "Termos", description: "Termos para agua caliente" },
  { id: "bombillas", name: "Bombillas", description: "Bombillas" },
  { id: "otros", name: "Otros", description: "Otros accesorios" },
]

export const SUBCATEGORIES: Subcategory[] = [
  { id: "mates-imperiales", name: "Mates Imperiales", category: "mates" },
  { id: "mates-tradicionales", name: "Mates Tradicionales", category: "mates" },
  { id: "mates-torpedos", name: "Mates Torpedos", category: "mates" },
]
