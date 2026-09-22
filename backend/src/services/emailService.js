import nodemailer from "nodemailer";
import dotenv from "dotenv";

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
      ? `🔐 ${otp} is your Janani Agro Verification Code`
      : `🔐 ${otp} is your Janani Agro Security Verification Code`;

    const ccEmail = (ADMIN_EMAIL && ADMIN_EMAIL.toLowerCase() !== to.toLowerCase()) ? ADMIN_EMAIL : undefined;

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      cc: ccEmail,
      subject,
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
