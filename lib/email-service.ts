import "server-only"
import { Resend } from "resend"
import type { Order } from "./types"
import { buildOrderEmail } from "./order-email"

/**
 * Server-only email service. Credentials live in environment variables and are
 * never exposed to the client.
 *
 * Required env vars:
 *  - RESEND_API_KEY   -> your Resend API key
 *  - BUSINESS_EMAIL   -> lagauchadamates@gmail.com (where notifications arrive)
 *  - EMAIL_FROM       -> optional verified sender. Defaults to Resend's sandbox
 *                        sender which only works for testing.
 */

type PaymentState = "nuevo" | "aprobado" | "pendiente" | "rechazado"

export async function sendOrderNotification(
  order: Order,
  paymentState: PaymentState = "nuevo",
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const businessEmail = process.env.BUSINESS_EMAIL
  const from = process.env.EMAIL_FROM || "La Gauchada <onboarding@resend.dev>"

  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY no está configurada" }
  }
  if (!businessEmail) {
    return { ok: false, error: "BUSINESS_EMAIL no está configurada" }
  }

  const resend = new Resend(apiKey)
  const { subject, html, text } = buildOrderEmail(order, paymentState)
  return sendRaw(resend, businessEmail, from, { subject, html, text, replyTo: order.customer.email })
}

/**
 * Sends a short payment-status update for a Mercado Pago payment. Used by the
 * webhook where we only have the payment data (not the full cart).
 */
export async function sendPaymentStatusNotification(info: {
  orderId: string
  status: string
  amount?: number
  payerEmail?: string
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const businessEmail = process.env.BUSINESS_EMAIL
  const from = process.env.EMAIL_FROM || "La Gauchada <onboarding@resend.dev>"

  if (!apiKey || !businessEmail) {
    return { ok: false, error: "Email no configurado" }
  }

  const statusLabels: Record<string, string> = {
    approved: "Pago APROBADO",
    pending: "Pago pendiente",
    in_process: "Pago en proceso",
    rejected: "Pago RECHAZADO",
    cancelled: "Pago cancelado",
    refunded: "Pago reembolsado",
  }
  const label = statusLabels[info.status] || `Estado de pago: ${info.status}`
  const amount =
    typeof info.amount === "number"
      ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(info.amount)
      : "-"

  const subject = `[La Gauchada] ${label} - ${info.orderId}`
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
      <h2>${label}</h2>
      <p>Pedido <strong>${info.orderId}</strong></p>
      <p>Monto: <strong>${amount}</strong></p>
      ${info.payerEmail ? `<p>Email del pagador: ${info.payerEmail}</p>` : ""}
      <p style="color:#666;font-size:13px;">Actualización automática de Mercado Pago.</p>
    </div>`
  const text = `${label}\nPedido: ${info.orderId}\nMonto: ${amount}${info.payerEmail ? `\nEmail: ${info.payerEmail}` : ""}`

  const resend = new Resend(apiKey)
  return sendRaw(resend, businessEmail, from, { subject, html, text })
}

async function sendRaw(
  resend: Resend,
  to: string,
  from: string,
  msg: { subject: string; html: string; text: string; replyTo?: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      replyTo: msg.replyTo || undefined,
    })

    if (error) {
      console.error("[email-service] Resend error:", error.message)
      return { ok: false, error: error.message }
    }
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido al enviar el correo"
    console.error("[email-service] Unexpected error:", message)
    return { ok: false, error: message }
  }
}
