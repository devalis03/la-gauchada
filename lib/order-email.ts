import type { Order } from "./types"

const paymentLabels: Record<Order["paymentMethod"], string> = {
  efectivo: "Efectivo",
  tarjeta: "Tarjeta de crédito/débito (Mercado Pago)",
  transferencia: "Transferencia bancaria",
}

function formatARS(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value)
}

/**
 * Builds the subject + HTML body for the internal order notification email
 * that gets sent to the business mailbox.
 *
 * `paymentState` lets callers distinguish a freshly placed order from a
 * Mercado Pago payment that has just been approved via webhook.
 */
export function buildOrderEmail(
  order: Order,
  paymentState: "nuevo" | "aprobado" | "pendiente" | "rechazado" = "nuevo",
) {
  const createdAt = new Date(order.createdAt).toLocaleString("es-AR", {
    dateStyle: "full",
    timeStyle: "short",
  })

  const stateLabels: Record<typeof paymentState, string> = {
    nuevo: "Nuevo pedido recibido",
    aprobado: "Pago aprobado (Mercado Pago)",
    pendiente: "Pago pendiente (Mercado Pago)",
    rechazado: "Pago rechazado (Mercado Pago)",
  }

  const subject = `[La Gauchada] ${stateLabels[paymentState]} - ${order.id}`

  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.product.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatARS(item.product.price)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatARS(item.product.price * item.quantity)}</td>
        </tr>`,
    )
    .join("")

  const c = order.customer

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#1a1a1a;">
    <h2 style="margin-bottom:4px;">${stateLabels[paymentState]}</h2>
    <p style="margin-top:0;color:#666;">Pedido <strong>${order.id}</strong> · ${createdAt}</p>

    <h3 style="border-bottom:2px solid #1a1a1a;padding-bottom:4px;">Cliente</h3>
    <p style="line-height:1.6;margin:0;">
      <strong>Nombre:</strong> ${c.firstName} ${c.lastName}<br/>
      <strong>DNI:</strong> ${c.dni || "-"}<br/>
      <strong>Teléfono:</strong> ${c.phone || "-"}<br/>
      <strong>Email:</strong> ${c.email || "-"}<br/>
      <strong>Dirección:</strong> ${c.address || "-"}, ${c.city || "-"} (${c.postalCode || "-"})<br/>
      ${c.notes ? `<strong>Notas:</strong> ${c.notes}<br/>` : ""}
    </p>

    <h3 style="border-bottom:2px solid #1a1a1a;padding-bottom:4px;">Productos</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px;text-align:left;">Producto</th>
          <th style="padding:8px;text-align:center;">Cant.</th>
          <th style="padding:8px;text-align:right;">Precio</th>
          <th style="padding:8px;text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <table style="width:100%;margin-top:16px;font-size:14px;">
      <tr><td style="padding:4px 8px;">Subtotal</td><td style="padding:4px 8px;text-align:right;">${formatARS(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 8px;">Envío</td><td style="padding:4px 8px;text-align:right;">${order.shipping === 0 ? "Gratis" : formatARS(order.shipping)}</td></tr>
      <tr style="font-weight:bold;font-size:16px;"><td style="padding:8px;border-top:2px solid #1a1a1a;">Total</td><td style="padding:8px;border-top:2px solid #1a1a1a;text-align:right;">${formatARS(order.total)}</td></tr>
    </table>

    <p style="margin-top:16px;"><strong>Método de pago:</strong> ${paymentLabels[order.paymentMethod]}</p>
  </div>`

  // Plain-text fallback so the message renders well everywhere.
  const text = [
    stateLabels[paymentState],
    `Pedido: ${order.id}`,
    `Fecha: ${createdAt}`,
    "",
    `Cliente: ${c.firstName} ${c.lastName}`,
    `DNI: ${c.dni || "-"}`,
    `Teléfono: ${c.phone || "-"}`,
    `Email: ${c.email || "-"}`,
    `Dirección: ${c.address || "-"}, ${c.city || "-"} (${c.postalCode || "-"})`,
    c.notes ? `Notas: ${c.notes}` : "",
    "",
    "Productos:",
    ...order.items.map(
      (i) => `- ${i.product.name} x${i.quantity} = ${formatARS(i.product.price * i.quantity)}`,
    ),
    "",
    `Subtotal: ${formatARS(order.subtotal)}`,
    `Envío: ${order.shipping === 0 ? "Gratis" : formatARS(order.shipping)}`,
    `Total: ${formatARS(order.total)}`,
    `Método de pago: ${paymentLabels[order.paymentMethod]}`,
  ]
    .filter(Boolean)
    .join("\n")

  return { subject, html, text }
}
