import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(request: Request) {
  const data = await request.json();
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues?.[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { name, email, message } = parsed.data;
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const html = `
    <h1>New contact message</h1>
    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Message:</strong></p>
    <p>${safeMessage}</p>
  `;

  await sendMail({
    to: process.env.SMTP_USER ?? email,
    subject: `Contact request from ${name}`,
    html,
  });

  return NextResponse.json({ message: "Your message was sent successfully." }, { status: 200 });
}
