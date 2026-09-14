import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { Resend } from "resend"
import type { Order } from "@/lib/types"

const DEFAULT_ADMIN_EMAIL = "lagauchadamates@gmail.com"
const DEFAULT_FROM_EMAIL = "onboarding@resend.dev"

type EmailAttachment = {
  filename: string
  content: string
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY")
  }

  return new Resend(apiKey)
}

function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
}

function getAdminEmail() {
  return (
    process.env.ORDER_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    DEFAULT_ADMIN_EMAIL
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value)
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value))
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function getPaymentMethodLabel(order: Order) {
  switch (order.paymentMethod) {
    case "tarjeta":
      return "Tarjeta / Mercado Pago"
    case "transferencia":
      return "Transferencia bancaria"
    default:
      return "Efectivo"
  }
}

function getOrderItemsHtml(order: Order) {
  return order.items
    .map(
      ({ product, quantity }) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${escapeHtml(product.name)}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: center;">${quantity}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(product.price * quantity)}</td>
        </tr>`,
    )
    .join("")
}

function getOrderSummaryHtml(order: Order) {
  return `
    <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; color: #252525;">
      <thead>
        <tr>
          <th style="padding: 10px 0; border-bottom: 2px solid #4a7c59; text-align: left;">Producto</th>
          <th style="padding: 10px 0; border-bottom: 2px solid #4a7c59; text-align: center;">Cantidad</th>
          <th style="padding: 10px 0; border-bottom: 2px solid #4a7c59; text-align: right;">Importe</th>
        </tr>
      </thead>
      <tbody>${getOrderItemsHtml(order)}</tbody>
    </table>
    <div style="margin-top: 18px; margin-left: auto; max-width: 260px; font-family: Arial, sans-serif;">
      <p style="display: flex; justify-content: space-between; margin: 6px 0;">Subtotal: <strong>${formatCurrency(order.subtotal)}</strong></p>
      <p style="display: flex; justify-content: space-between; margin: 6px 0;">Envío: <strong>${order.shipping === 0 ? "Gratis" : formatCurrency(order.shipping)}</strong></p>
      <p style="display: flex; justify-content: space-between; margin: 12px 0 0; padding-top: 12px; border-top: 2px solid #4a7c59; font-size: 18px;">Total: <strong>${formatCurrency(order.total)}</strong></p>
    </div>`
}

function getEmailLayout(title: string, content: string) {
  return `<!doctype html>
<html lang="es">
  <body style="margin: 0; background: #f5f3ef; padding: 32px 16px;">
    <main style="box-sizing: border-box; max-width: 680px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 8px;">
      <div style="border-bottom: 3px solid #4a7c59; padding-bottom: 16px; margin-bottom: 24px;">
        <p style="margin: 0; color: #4a7c59; font: 700 14px Arial, sans-serif; letter-spacing: 1px; text-transform: uppercase;">La Gauchada</p>
        <h1 style="margin: 12px 0 0; color: #252525; font: 700 28px Georgia, serif;">${title}</h1>
      </div>
      ${content}
      <p style="margin: 32px 0 0; color: #6b7280; font: 13px Arial, sans-serif;">La Gauchada Mates</p>
    </main>
  </body>
</html>`
}

function getCustomerEmailHtml(order: Order) {
  const customerName = escapeHtml(`${order.customer.firstName} ${order.customer.lastName}`)

  return getEmailLayout(
    "Confirmación de tu compra",
    `<p style="font: 16px/1.6 Arial, sans-serif; color: #252525;">Hola ${customerName},</p>
     <p style="font: 16px/1.6 Arial, sans-serif; color: #252525;">Recibimos tu pedido y ya estamos preparando todo. Adjuntamos la factura para que puedas guardarla.</p>
     <p style="font: 14px/1.6 Arial, sans-serif; color: #6b7280;">Pedido: <strong style="color: #252525;">${escapeHtml(order.id)}</strong><br />Fecha: ${formatDate(order.createdAt)}<br />Medio de pago: ${getPaymentMethodLabel(order)}</p>
     ${getOrderSummaryHtml(order)}
     <p style="font: 14px/1.6 Arial, sans-serif; color: #6b7280;">Te contactaremos por WhatsApp o email cuando haya novedades sobre tu pedido.</p>`,
  )
}

function getSellerEmailHtml(order: Order) {
  const customerName = escapeHtml(`${order.customer.firstName} ${order.customer.lastName}`)
  const customer = order.customer

  return getEmailLayout(
    "Nueva compra confirmada",
    `<p style="font: 16px/1.6 Arial, sans-serif; color: #252525;">Se confirmó una nueva compra.</p>
     <p style="font: 14px/1.6 Arial, sans-serif; color: #6b7280;">Pedido: <strong style="color: #252525;">${escapeHtml(order.id)}</strong><br />Fecha: ${formatDate(order.createdAt)}<br />Medio de pago: ${getPaymentMethodLabel(order)}</p>
     <h2 style="margin: 24px 0 8px; font: 700 18px Georgia, serif; color: #252525;">Datos del comprador</h2>
     <p style="font: 14px/1.6 Arial, sans-serif; color: #252525;">${customerName}<br />Email: ${escapeHtml(customer.email)}<br />Teléfono: ${escapeHtml(customer.phone)}<br />DNI: ${escapeHtml(customer.dni)}<br />Entrega: ${escapeHtml(customer.address)}, ${escapeHtml(customer.city)}, ${escapeHtml(customer.postalCode)}${customer.notes ? `<br />Notas: ${escapeHtml(customer.notes)}` : ""}</p>
     <h2 style="margin: 24px 0 8px; font: 700 18px Georgia, serif; color: #252525;">Detalle de la compra</h2>
     ${getOrderSummaryHtml(order)}`,
  )
}

async function createInvoiceAttachment(order: Order): Promise<EmailAttachment> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595, 842])
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold)
  const green = rgb(0.29, 0.49, 0.35)
  const dark = rgb(0.15, 0.15, 0.15)
  const gray = rgb(0.4, 0.4, 0.4)
  let y = 790

  page.drawText("LA GAUCHADA", { x: 48, y, size: 20, font: boldFont, color: green })
  y -= 28
  page.drawText("Comprobante de compra", { x: 48, y, size: 14, font: boldFont, color: dark })
  page.drawText(`Pedido: ${order.id}`, { x: 360, y, size: 10, font: regularFont, color: gray })
  y -= 18
  page.drawText(`Fecha: ${formatDate(order.createdAt)}`, { x: 360, y, size: 10, font: regularFont, color: gray })
  y -= 30

  page.drawLine({ start: { x: 48, y }, end: { x: 547, y }, thickness: 2, color: green })
  y -= 24
  page.drawText(`Cliente: ${order.customer.firstName} ${order.customer.lastName}`, { x: 48, y, size: 10, font: regularFont, color: dark })
  y -= 16
  page.drawText(`Email: ${order.customer.email}`, { x: 48, y, size: 10, font: regularFont, color: dark })
  y -= 16
  page.drawText(`Entrega: ${order.customer.address}, ${order.customer.city}, ${order.customer.postalCode}`, { x: 48, y, size: 10, font: regularFont, color: dark })
  y -= 30

  page.drawText("Producto", { x: 48, y, size: 10, font: boldFont, color: dark })
  page.drawText("Cant.", { x: 390, y, size: 10, font: boldFont, color: dark })
  page.drawText("Importe", { x: 475, y, size: 10, font: boldFont, color: dark })
  y -= 8
  page.drawLine({ start: { x: 48, y }, end: { x: 547, y }, thickness: 1, color: green })
  y -= 20

  for (const item of order.items) {
    const productName = item.product.name.length > 52 ? `${item.product.name.slice(0, 49)}...` : item.product.name
    page.drawText(productName, { x: 48, y, size: 9, font: regularFont, color: dark })
    page.drawText(String(item.quantity), { x: 400, y, size: 9, font: regularFont, color: dark })
    page.drawText(formatCurrency(item.product.price * item.quantity), { x: 475, y, size: 9, font: regularFont, color: dark })
    y -= 18
  }

  y -= 10
  page.drawLine({ start: { x: 350, y }, end: { x: 547, y }, thickness: 1, color: green })
  y -= 20
  page.drawText("Subtotal", { x: 390, y, size: 10, font: regularFont, color: gray })
  page.drawText(formatCurrency(order.subtotal), { x: 475, y, size: 10, font: regularFont, color: dark })
  y -= 18
  page.drawText("Envío", { x: 390, y, size: 10, font: regularFont, color: gray })
  page.drawText(order.shipping === 0 ? "Gratis" : formatCurrency(order.shipping), { x: 475, y, size: 10, font: regularFont, color: dark })
  y -= 22
  page.drawText("TOTAL", { x: 390, y, size: 12, font: boldFont, color: green })
  page.drawText(formatCurrency(order.total), { x: 475, y, size: 12, font: boldFont, color: dark })
  y -= 44
  page.drawText("Gracias por elegir La Gauchada.", { x: 48, y, size: 10, font: regularFont, color: gray })

  const bytes = await pdf.save()
  return {
    filename: `factura-${order.id}.pdf`,
    content: Buffer.from(bytes).toString("base64"),
  }
}

async function sendEmail({
  to,
  subject,
  html,
  attachments,
  idempotencyKey,
}: {
  to: string
  subject: string
  html: string
  attachments?: EmailAttachment[]
  idempotencyKey: string
}) {
  const resend = getResendClient()
  const { error } = await resend.emails.send(
    {
      from: `La Gauchada <${getFromEmail()}>`,
      to,
      subject,
      html,
      attachments,
    },
    { idempotencyKey },
  )

  if (error) {
    const details = "name" in error && error.name ? `${error.name}: ` : ""
    throw new Error(`Email delivery failed: ${details}${error.message}`)
  }
}

export async function sendAdminOrderNotification(order: Order) {
  await sendEmail({
    to: getAdminEmail(),
    subject: `Nueva compra confirmada - ${order.id}`,
    html: getSellerEmailHtml(order),
    idempotencyKey: `order-${order.id}-seller-confirmation`,
  })
}

export async function sendCustomerOrderConfirmation(order: Order) {
  const attachment = await createInvoiceAttachment(order)
  await sendEmail({
    to: order.customer.email,
    subject: `Confirmación de compra - ${order.id}`,
    html: getCustomerEmailHtml(order),
    attachments: [attachment],
    idempotencyKey: `order-${order.id}-customer-confirmation`,
  })
}

export async function sendOrderConfirmationEmails(order: Order) {
  await Promise.all([
    sendAdminOrderNotification(order),
    sendCustomerOrderConfirmation(order),
  ])
}
