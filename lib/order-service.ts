import type { Order, CartItem, CustomerInfo } from "./types"

export type { Order } from "./types"

const ORDERS_API_BASE = "/api/orders"

/**
 * Order Management Service
 * Handles order creation, retrieval, and status updates via API routes
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

export class OrderApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = "OrderApiError"
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as { data?: T; error?: string }

  if (!response.ok || !payload.data) {
    throw new OrderApiError(
      payload.error || "Error en la respuesta del servidor",
      response.status
    )
  }

  return payload.data
}

export async function saveOrder(order: Order): Promise<Order> {
  const response = await fetch(ORDERS_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order }),
  })

  return parseResponse<Order>(response)
}

export async function getAllOrders(): Promise<Order[]> {
  const response = await fetch(ORDERS_API_BASE, {
    method: "GET",
    cache: "no-store",
  })

  return parseResponse<Order[]>(response)
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const response = await fetch(`${ORDERS_API_BASE}/${orderId}`, {
    method: "GET",
    cache: "no-store",
  })

  if (response.status === 404) {
    return null
  }

  return parseResponse<Order>(response)
}

export async function getTransferenceOrders(): Promise<Order[]> {
  const orders = await getAllOrders()
  return orders.filter((o) => o.paymentMethod === "transferencia")
}

export async function getPendingTransferenceOrders(): Promise<Order[]> {
  const orders = await getAllOrders()
  return orders.filter(
    (o) => o.paymentMethod === "transferencia" && o.transferenceStatus === "pendiente"
  )
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  transferenceStatus?: Order["transferenceStatus"]
): Promise<Order | null> {
  const response = await fetch(`${ORDERS_API_BASE}/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status, transferenceStatus }),
  })

  if (response.status === 404) {
    return null
  }

  return parseResponse<Order>(response)
}

export async function confirmTransference(orderId: string): Promise<Order | null> {
  return updateOrderStatus(orderId, "confirmed", "confirmado")
}

export type OrderStats = {
  totalOrders: number
  pendingTransferences: number
  confirmedOrders: number
  totalRevenue: number
}

export async function getOrderStats(): Promise<OrderStats> {
  const response = await fetch(`${ORDERS_API_BASE}/stats`, {
    method: "GET",
    cache: "no-store",
  })

  return parseResponse<OrderStats>(response)
}
