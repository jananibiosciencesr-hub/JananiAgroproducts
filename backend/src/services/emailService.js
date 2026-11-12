import nodemailer from "nodemailer";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || "jananibiosciences.r@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "gvwxapfllucnayzt";
const SMTP_FROM = process.env.SMTP_FROM || `"Janani Agro Products" <${SMTP_USER}>`;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "jananibiosciences.r@gmail.com";

// Create reusable transporter
export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

/**
 * Send 6-Digit Real OTP Email for Admin or Customer Login
 */
export async function sendOtpEmail({ to, otp, purpose = "login", name = "Valued Patron" }) {
  try {
    const isLogin = purpose === "login";
    const subject = isLogin
      ? `Janani Agro Products - Your Verification Code is ${otp}`
      : `Janani Agro Products - Account Security Verification Code: ${otp}`;

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      text: `Hello ${name},\n\nYour Janani Agro Products verification code is: ${otp}\n\nThis code is valid for 5 minutes.\n\nIf you did not request this code, please ignore this email.\n\nRegards,\nJanani Agro Products Support`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f4; margin: 0; padding: 20px; }
            .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2ece2; }
            .header { background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%); padding: 30px 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
            .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.85; }
            .body { padding: 30px; }
            .greeting { font-size: 16px; color: #2d3748; font-weight: 600; margin-bottom: 12px; }
            .message { font-size: 14px; color: #4a5568; line-height: 1.6; margin-bottom: 24px; }
            .otp-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #15803d; margin-bottom: 8px; }
            .otp-code { font-size: 40px; font-weight: 800; letter-spacing: 10px; color: #166534; font-family: monospace; }
            .expiry { font-size: 12px; color: #64748b; margin-top: 8px; }
            .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; font-size: 12px; color: #92400e; margin-top: 20px; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>JANANI AGRO PRODUCTS</h1>
              <p>Nurturing Nature, Enriching Future</p>
            </div>
            <div class="body">
              <div class="greeting">Hello, ${name}</div>
              <div class="message">
                You have requested a secure sign-in verification code for your <strong>Janani Agro Products</strong> account.
              </div>
              <div class="otp-box">
                <div class="otp-label">Your One-Time Password (OTP)</div>
                <div class="otp-code">${otp}</div>
                <div class="expiry">Valid for 5 minutes only</div>
              </div>
              <div class="warning">
                <strong>Security Notice:</strong> If you did not request this login code, please ignore this email or contact care@jananiagro.com immediately. Never share your OTP with anyone.
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Janani Agro Products &bull; Lodhika GIDC, Gujarat, India<br>
              This is an automated security transmission.
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log(`[SMTP SUCCESS] Sent real OTP (${otp}) to ${to}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to send OTP to ${to}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Send Official Order Tax Invoice Email strictly to the Customer
 */
export async function sendOrderInvoiceEmail({
  to,
  customerName = "Valued Patron",
  orderNumber,
  items = [],
  total = 0,
  subtotal = 0,
  gstAmount = 0,
  shippingFee = 0,
  discount = 0,
  paymentMethod = "Prepaid Online / UPI",
  shippingAddress = "Registered Delivery Address",
  orderDate
}) {
  try {
    if (!to || !to.includes("@") || to.endsWith("@jananiagro.com")) {
      return { success: false, error: "Invalid customer recipient email." };
    }

    const cleanTo = to.trim().toLowerCase();
    const formattedDate = orderDate || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const formattedTotal = Number(total || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const subject = `Order Confirmed: #${orderNumber} - Janani Agro Products Official Tax Invoice`;

    const itemsListHtml = (Array.isArray(items) ? items : []).map((it, idx) => {
      const name = it.name || it.title || "Agro Formulation Product";
      const qty = Number(it.quantity || it.qty || 1);
      const price = Number(it.price || 0);
      const lineTotal = (qty * price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 8px; font-size: 13px; color: #334155;">${idx + 1}. ${name}</td>
          <td style="padding: 10px 8px; font-size: 13px; color: #334155; text-align: center;">${qty}</td>
          <td style="padding: 10px 8px; font-size: 13px; color: #334155; text-align: right;">₹${price.toLocaleString("en-IN")}</td>
          <td style="padding: 10px 8px; font-size: 13px; color: #1e293b; font-weight: 600; text-align: right;">₹${lineTotal}</td>
        </tr>
      `;
    }).join("");

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: cleanTo,
      subject,
      text: `Hello ${customerName},\n\nThank you for choosing Janani Agro Products! Your order #${orderNumber} has been confirmed.\n\nTotal Paid: ₹${formattedTotal}\nPayment Mode: ${paymentMethod}\nShipping To: ${shippingAddress}\n\nWe will notify you once your order is dispatched.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background: #075B32; padding: 28px 24px; text-align: center; color: white; }
            .badge { display: inline-block; background: #E7A91A; color: #075B32; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px; }
            .content { padding: 28px 24px; }
            .order-meta { background: #f8fafc; border-radius: 8px; padding: 14px 18px; margin: 20px 0; border: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; padding: 8px; border-bottom: 2px solid #e2e8f0; }
            .total-row { border-top: 2px solid #e2e8f0; font-size: 15px; font-weight: 700; color: #075B32; }
            .footer { background: #f8fafc; padding: 16px 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="badge">Official GST Tax Invoice</span>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">JANANI AGRO PRODUCTS</h1>
              <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Order Confirmation & Receipt</p>
            </div>
            <div class="content">
              <p style="font-size: 15px; margin: 0 0 12px; font-weight: 600;">Namaste, ${customerName}!</p>
              <p style="font-size: 13px; color: #475569; line-height: 1.6; margin: 0 0 18px;">
                Thank you for choosing Janani Agro Products. Your order <strong>#${orderNumber}</strong> has been confirmed and scheduled for dispatch from our Lodhika GIDC facility.
              </p>

              <div class="order-meta">
                <table style="width: 100%;">
                  <tr>
                    <td style="font-size: 12px; color: #64748b;">Order Date:</td>
                    <td style="font-size: 12px; font-weight: 600; text-align: right;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #64748b;">Payment Method:</td>
                    <td style="font-size: 12px; font-weight: 600; text-align: right;">${paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 12px; color: #64748b;">Deliver To:</td>
                    <td style="font-size: 12px; font-weight: 600; text-align: right;">${shippingAddress}</td>
                  </tr>
                </table>
              </div>

              <table style="width: 100%; margin-top: 18px;">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsListHtml}
                  <tr class="total-row">
                    <td colspan="3" style="padding: 12px 8px; text-align: right;">Final Total:</td>
                    <td style="padding: 12px 8px; text-align: right; color: #075B32; font-size: 16px;">₹${formattedTotal}</td>
                  </tr>
                </tbody>
              </table>

              <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center;">
                Need help with your order? Reach our farm advisory desk at <a href="tel:+919311416225" style="color: #075B32; font-weight: 600;">+91 93114 16225</a>.
              </p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Janani Agro Products Pvt. Ltd. &bull; Lodhika GIDC, Gujarat, India.<br>
              This invoice was sent strictly to your registered email (${cleanTo}).
            </div>
          </div>
        </body>
        </html>
      `
    });

    console.log(`[ORDER INVOICE SUCCESS] Invoice sent strictly to customer ${cleanTo} for order #${orderNumber}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipient: cleanTo };
  } catch (err) {
    console.error(`[ORDER INVOICE ERROR] Failed to send invoice to ${to}:`, err);
    return { success: false, error: err.message };
  }
}
