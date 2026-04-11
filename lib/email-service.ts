import type { Order } from "./types"

/**
 * Email Service for La Gauchada
 * This is an integration-ready service that can be connected to:
 * - Resend (resend.com)
 * - SendGrid
 * - Nodemailer
 * - AWS SES
 * - Or any other email provider
 */

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@lagauchada.com"
const STORE_NAME = "La Gauchada"

export interface EmailConfig {
  provider?: "resend" | "sendgrid" | "nodemailer" | "mock"
  apiKey?: string
  adminEmail?: string
}

let emailConfig: EmailConfig = {
  provider: "mock", // Default to mock for development
  adminEmail: ADMIN_EMAIL,
}

export function setEmailConfig(config: Partial<EmailConfig>) {
  emailConfig = { ...emailConfig, ...config }
}

/**
 * Generate order summary HTML for emails
 */
function generateOrderSummaryHTML(order: Order): string {
  const itemsHTML = order.items
    .map(
      (item) =>
        `
    <tr style="border-bottom: 1px solid #e0e0e0;">
      <td style="padding: 12px; text-align: left; color: #333;">${item.product.name}</td>
      <td style="padding: 12px; text-align: center; color: #666;">x${item.quantity}</td>
      <td style="padding: 12px; text-align: right; color: #333;">$${(item.product.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join("")

  const transferenceInfo =
    order.paymentMethod === "transferencia"
      ? `
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 16px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404; font-weight: bold;">Estado de Transferencia: ${order.transferenceStatus === "confirmado" ? "✓ Confirmado" : "⏳ Pendiente de Verificación"}</p>
      <p style="margin: 8px 0 0 0; color: #856404; font-size: 14px;">Nos confirmaremos contigo una vez que verifiquemos la transferencia.</p>
    </div>
  `
      : ""

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #4a7c59; margin-bottom: 24px;">Detalles del Pedido</h2>
      
      <div style="background-color: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <p><strong>Número de Pedido:</strong> ${order.id}</p>
        <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString("es-AR")}</p>
      </div>

      <h3 style="color: #333; margin-top: 24px; margin-bottom: 12px;">Productos:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f0f0f0; border-bottom: 2px solid #ddd;">
            <th style="padding: 12px; text-align: left; color: #333;">Producto</th>
            <th style="padding: 12px; text-align: center; color: #333;">Cantidad</th>
            <th style="padding: 12px; text-align: right; color: #333;">Precio</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div style="margin-top: 16px; text-align: right;">
        <p style="margin: 8px 0;"><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
        <p style="margin: 8px 0;"><strong>Envío:</strong> ${order.shipping === 0 ? "Gratis" : `$${order.shipping.toFixed(2)}`}</p>
        <p style="font-size: 18px; color: #4a7c59; margin: 12px 0 0 0;"><strong>Total: $${order.total.toFixed(2)}</strong></p>
      </div>

      ${transferenceInfo}

      <h3 style="color: #333; margin-top: 24px; margin-bottom: 12px;">Información de Envío:</h3>
      <p style="margin: 4px 0;"><strong>${order.customer.firstName} ${order.customer.lastName}</strong></p>
      <p style="margin: 4px 0;">${order.customer.address}</p>
      <p style="margin: 4px 0;">${order.customer.city}, ${order.customer.postalCode}</p>
      <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${order.customer.phone}</p>

      <p style="margin-top: 24px; color: #666; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 16px;">
        Gracias por comprar en ${STORE_NAME}. Si tienes preguntas, no dudes en contactarnos.
      </p>
    </div>
  `
}

/**
 * Send order confirmation email to admin
 */
export async function sendAdminOrderNotification(order: Order): Promise<boolean> {
  const subject = `Nuevo Pedido Recibido - #${order.id}`
  const adminNote =
    order.paymentMethod === "transferencia"
      ? `\n\n⚠️ IMPORTANTE: Este pedido fue realizado mediante TRANSFERENCIA BANCARIA.\nEstado: ${order.transferenceStatus || "Pendiente de verificación"}\nPor favor, verifica la transferencia e ingresa a la administración para confirmarla.`
      : ""

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4a7c59;">Nuevo Pedido en ${STORE_NAME}</h1>
      <p style="font-size: 16px; margin-bottom: 20px;">
        Se ha recibido un nuevo pedido. Aquí están los detalles:
      </p>
      
      <div style="background-color: #e8f5e9; border-left: 4px solid #4a7c59; padding: 16px; margin-bottom: 20px; border-radius: 4px;">
        <p style="margin: 0;"><strong>Cliente:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
        <p style="margin: 4px 0;"><strong>Email:</strong> ${order.customer.email}</p>
        <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${order.customer.phone}</p>
        <p style="margin: 4px 0;"><strong>Método de Pago:</strong> ${order.paymentMethod === "efectivo" ? "Efectivo" : order.paymentMethod === "tarjeta" ? "Tarjeta" : "Transferencia Bancaria"}</p>
      </div>

      ${generateOrderSummaryHTML(order)}

      ${adminNote ? `<p style="color: #d32f2f; background-color: #ffebee; padding: 12px; border-radius: 4px; margin-top: 20px;"><strong>${adminNote}</strong></p>` : ""}

      <p style="margin-top: 24px; color: #666; font-size: 12px;">
        Inicia sesión en la administración para ver más detalles: <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://tu-dominio.com"}/admin" style="color: #4a7c59;">Admin Panel</a>
      </p>
    </div>
  `

  return sendEmail(emailConfig.adminEmail || ADMIN_EMAIL, subject, htmlContent)
}

/**
 * Send order confirmation email to customer
 */
export async function sendCustomerOrderConfirmation(order: Order): Promise<boolean> {
  const subject = `Pedido Confirmado - ${STORE_NAME} #${order.id}`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4a7c59;">Pedido Confirmado en ${STORE_NAME}</h1>
      <p style="font-size: 16px; margin-bottom: 20px;">
        Hola ${order.customer.firstName},<br>
        Gracias por tu compra. Te confirmamos que hemos recibido tu pedido.
      </p>

      ${generateOrderSummaryHTML(order)}

      <div style="background-color: #e3f2fd; border-left: 4px solid #2196F3; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #1565c0;"><strong>¿Qué sucede ahora?</strong></p>
        <ul style="margin: 8px 0 0 0; color: #1565c0; padding-left: 20px;">
          <li>Verificaremos tu pedido</li>
          <li>Te enviaremos un email con el seguimiento</li>
          <li>Tu pedido será enviado pronto</li>
        </ul>
      </div>

      <p style="margin-top: 24px; color: #666; font-size: 14px;">
        Si tienes preguntas sobre tu pedido, no dudes en responder a este email.
      </p>
    </div>
  `

  return sendEmail(order.customer.email, subject, htmlContent)
}

/**
 * Send transfer confirmation email to customer
 */
export async function sendTransferConfirmationEmail(order: Order): Promise<boolean> {
  const subject = `Transferencia Confirmada - Pedido #${order.id} en ${STORE_NAME}`

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4a7c59;">Transferencia Bancaria Confirmada</h1>
      <p style="font-size: 16px; margin-bottom: 20px;">
        Hola ${order.customer.firstName},<br>
        Excelente noticia: Hemos recibido y confirmado tu transferencia bancaria.
      </p>

      <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 16px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #2e7d32;"><strong>✓ Transferencia Confirmada</strong></p>
        <p style="margin: 8px 0 0 0; color: #2e7d32; font-size: 14px;">Tu pedido está confirmado y será procesado inmediatamente.</p>
      </div>

      <h3 style="color: #333; margin-top: 24px; margin-bottom: 12px;">Resumen del Pedido:</h3>
      <p><strong>Número de Pedido:</strong> ${order.id}</p>
      <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>

      <p style="margin-top: 24px; color: #666; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 16px;">
        Tu pedido será enviado pronto. Te notificaremos cuando esté en camino.
      </p>
    </div>
  `

  return sendEmail(order.customer.email, subject, htmlContent)
}

/**
 * Core email sending function
 * This is where you would integrate with your email provider
 */
async function sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
  console.log(`[Email Service] Sending email to: ${to}`)
  console.log(`[Email Service] Subject: ${subject}`)

  // Mock implementation for development
  if (emailConfig.provider === "mock") {
    console.log("[Email Service] Using mock provider (development mode)")
    console.log(`[Email Service] Email would be sent with HTML content (${htmlContent.length} chars)`)

    // In production, you would uncomment and configure the actual provider:

    // === Resend Integration ===
    // if (emailConfig.provider === 'resend' && emailConfig.apiKey) {
    //   const { Resend } = await import('resend');
    //   const resend = new Resend(emailConfig.apiKey);
    //   const response = await resend.emails.send({
    //     from: 'noreply@lagauchada.com',
    //     to,
    //     subject,
    //     html: htmlContent,
    //   });
    //   return !response.error;
    // }

    // === SendGrid Integration ===
    // if (emailConfig.provider === 'sendgrid' && emailConfig.apiKey) {
    //   const sgMail = require('@sendgrid/mail');
    //   sgMail.setApiKey(emailConfig.apiKey);
    //   try {
    //     await sgMail.send({
    //       to,
    //       from: 'noreply@lagauchada.com',
    //       subject,
    //       html: htmlContent,
    //     });
    //     return true;
    //   } catch (error) {
    //     console.error('[Email Service] SendGrid error:', error);
    //     return false;
    //   }
    // }

    // === Nodemailer Integration ===
    // if (emailConfig.provider === 'nodemailer') {
    //   const nodemailer = require('nodemailer');
    //   const transporter = nodemailer.createTransport({
    //     service: 'gmail', // or your email service
    //     auth: {
    //       user: process.env.EMAIL_USER,
    //       pass: process.env.EMAIL_PASSWORD,
    //     },
    //   });
    //   try {
    //     await transporter.sendMail({
    //       from: 'noreply@lagauchada.com',
    //       to,
    //       subject,
    //       html: htmlContent,
    //     });
    //     return true;
    //   } catch (error) {
    //     console.error('[Email Service] Nodemailer error:', error);
    //     return false;
    //   }
    // }

    return true // Success in mock mode
  }

  return false
}
