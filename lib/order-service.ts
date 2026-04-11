import type { Order, CartItem, CustomerInfo } from "./types"

const ORDERS_STORAGE_KEY = "la-gauchada-orders"

/**
 * Order Management Service
 * Handles order creation, retrieval, and status updates
 * Uses localStorage for development; ready to be migrated to a database
 */

export function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

export function createOrder(
  items: CartItem[],
  customer: CustomerInfo,
  subtotal: number,
  shipping: number
): Order {
  return {
    id: generateOrderId(),
    items,
    customer,
    total: subtotal + shipping,
    subtotal,
    shipping,
    createdAt: new Date().toISOString(),
    status: "pending",
    paymentMethod: customer.paymentMethod,
    transferenceStatus: customer.paymentMethod === "transferencia" ? "pendiente" : undefined,
  }
}

export function saveOrder(order: Order): void {
  try {
    const orders = getAllOrders()
    orders.push(order)
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  } catch (error) {
    console.error("[Order Service] Failed to save order:", error)
    throw new Error("No se pudo guardar el pedido")
  }
}

export function getAllOrders(): Order[] {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("[Order Service] Failed to load orders:", error)
    return []
  }
}

export function getOrderById(orderId: string): Order | null {
  const orders = getAllOrders()
  return orders.find((o) => o.id === orderId) || null
}

export function getTransferenceOrders(): Order[] {
  const orders = getAllOrders()
  return orders.filter((o) => o.paymentMethod === "transferencia")
}

export function getPendingTransferenceOrders(): Order[] {
  const orders = getAllOrders()
  return orders.filter(
    (o) => o.paymentMethod === "transferencia" && o.transferenceStatus === "pendiente"
  )
}

export function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  transferenceStatus?: Order["transferenceStatus"]
): Order | null {
  try {
    const orders = getAllOrders()
    const orderIndex = orders.findIndex((o) => o.id === orderId)

    if (orderIndex === -1) {
      return null
    }

    orders[orderIndex].status = status
    if (transferenceStatus !== undefined) {
      orders[orderIndex].transferenceStatus = transferenceStatus
    }

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
    return orders[orderIndex]
  } catch (error) {
    console.error("[Order Service] Failed to update order:", error)
    return null
  }
}

export function confirmTransference(orderId: string): Order | null {
  return updateOrderStatus(orderId, "confirmed", "confirmado")
}

export function getOrderStats() {
  const orders = getAllOrders()
  return {
    totalOrders: orders.length,
    pendingTransferences: orders.filter(
      (o) => o.paymentMethod === "transferencia" && o.transferenceStatus === "pendiente"
    ).length,
    confirmedOrders: orders.filter((o) => o.status === "confirmed").length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
  }
}
