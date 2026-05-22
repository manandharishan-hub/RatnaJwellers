import nodemailer from "nodemailer";

const fromAddress = process.env.EMAIL_FROM ?? "no-reply@ratnajewels.com";

function createEmailTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT ?? 587);
  const smtpSecure = process.env.SMTP_SECURE === "true";
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASSWORD must be defined for email delivery.");
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = createEmailTransporter();
  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  });
}

export function buildVerificationEmail(token: string, email: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return {
    subject: "Verify your Ratna Jewels account",
    html: `
      <h1>Welcome to Ratna Jewels</h1>
      <p>Click the button below to verify your email address.</p>
      <a href="${baseUrl}/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}" style="display:inline-block;padding:12px 20px;background:#C9A84C;color:#111;font-weight:bold;text-decoration:none;border-radius:8px;">Verify Email</a>
      <p>If you did not create an account, ignore this email.</p>
    `,
  };
}

export function buildResetPasswordEmail(token: string, email: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return {
    subject: "Reset your Ratna Jewels password",
    html: `
      <h1>Password reset</h1>
      <p>Use this link to reset your password for ${email}.</p>
      <a href="${baseUrl}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}" style="display:inline-block;padding:12px 20px;background:#0A1628;color:#fff;font-weight:bold;text-decoration:none;border-radius:8px;">Reset Password</a>
      <p>If you did not request a reset, ignore this email.</p>
    `,
  };
}

export function buildAdminWelcomeEmail(password: string, email: string, name: string, role: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return {
    subject: "Welcome to Ratna Jewels admin portal",
    html: `
      <h1>Welcome ${name}</h1>
      <p>You have been added as a ${role} for Ratna Jewels.</p>
      <p>Sign in at <a href="${baseUrl}/login">${baseUrl}/login</a> using these credentials:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>After signing in, navigate to the admin dashboard to manage the store.</p>
    `,
  };
}

