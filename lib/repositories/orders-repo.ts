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
    paymentStatus: row.payment_status as Order["paymentStatus"],
    paymentId: row.payment_id ?? undefined,
    externalReference: row.external_reference ?? undefined,
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
    payment_id: order.paymentId ?? null,
    external_reference: order.externalReference ?? null,
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

export async function findOrderByExternalReference(
  externalReference: string
): Promise<Order | null> {
  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("external_reference", externalReference)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to fetch order by external reference: ${error.message}`)
  }

  return data ? mapOrderRowToDomain(data) : null
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

export async function setOrderPayment(
  orderId: string,
  paymentStatus: NonNullable<Order["paymentStatus"]>,
  paymentId?: string
): Promise<Order | null> {
  const supabase = getSupabaseAdminClient()
  const updatePayload: Database["public"]["Tables"]["orders"]["Update"] = {
    payment_status: paymentStatus,
  }

  if (paymentId) {
    updatePayload.payment_id = paymentId
  }

  if (paymentStatus === "approved") {
    updatePayload.status = "confirmed"
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", orderId)
    .select("*")
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to update order payment: ${error.message}`)
  }

  return data ? mapOrderRowToDomain(data) : null
}

export async function registerPaymentNotification(paymentId: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient()
  const { error } = await supabase
    .from("payment_notifications")
    .insert({ payment_id: paymentId })

  if (!error) {
    return true
  }

  if (error.code === "23505") {
    return false
  }

  throw new Error(`Failed to register payment notification: ${error.message}`)
}

export async function setOrderExternalReference(
  orderId: string,
  externalReference: string
): Promise<void> {
  const supabase = getSupabaseAdminClient()
  const { error } = await supabase
    .from("orders")
    .update({ external_reference: externalReference })
    .eq("id", orderId)

  if (error) {
    throw new Error(`Failed to save external reference: ${error.message}`)
  }
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
