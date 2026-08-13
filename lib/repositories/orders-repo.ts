import type { Order } from "@/lib/types"
import { getSupabaseAdminClient } from "@/lib/supabase/server"
import type { Database, Json } from "@/lib/supabase/types"

type OrderRow = Database["public"]["Tables"]["orders"]["Row"]

function mapOrderRowToDomain(row: OrderRow): Order {
  return {
    id: row.id,
    items: row.items as unknown as Order["items"],
    customer: row.customer as unknown as Order["customer"],
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    createdAt: row.created_at,
    status: row.status as Order["status"],
    paymentMethod: row.payment_method as Order["paymentMethod"],
    transferenceStatus: (row.transference_status ?? undefined) as Order["transferenceStatus"],
  }
}

function mapOrderDomainToInsert(order: Order): Database["public"]["Tables"]["orders"]["Insert"] {
  return {
    id: order.id,
    items: order.items as unknown as Json,
    customer: order.customer as unknown as Json,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    payment_method: order.paymentMethod,
    transference_status: order.transferenceStatus ?? null,
    payment_status: "pending",
  }
}

export async function createOrderRecord(order: Order): Promise<Order> {
  const supabase = getSupabaseAdminClient()
  const insertPayload = mapOrderDomainToInsert(order)

  const { data, error } = await supabase
    .from("orders")
    .insert(insertPayload)
    .select("*")
    .single()

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`)
  }

  return mapOrderRowToDomain(data)
}

export async function listOrders(): Promise<Order[]> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to list orders: ${error.message}`)
  }

  return (data ?? []).map(mapOrderRowToDomain)
}

export async function findOrderById(orderId: string): Promise<Order | null> {
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch order: ${error.message}`)
  }

  if (!data) {
    return null
  }

  return mapOrderRowToDomain(data)
}

export async function setOrderStatus(
  orderId: string,
  status: Order["status"],
  transferenceStatus?: Order["transferenceStatus"]
): Promise<Order | null> {
  const supabase = getSupabaseAdminClient()

  const updatePayload: Database["public"]["Tables"]["orders"]["Update"] = {
    status,
  }

  if (transferenceStatus !== undefined) {
    updatePayload.transference_status = transferenceStatus ?? null
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", orderId)
    .select("*")
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`)
  }

  if (!data) {
    return null
  }

  return mapOrderRowToDomain(data)
}

export async function readOrderStats() {
  const orders = await listOrders()
  return {
    totalOrders: orders.length,
    pendingTransferences: orders.filter(
      (order) =>
        order.paymentMethod === "transferencia" && order.transferenceStatus === "pendiente"
    ).length,
    confirmedOrders: orders.filter((order) => order.status === "confirmed").length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
  }
}
