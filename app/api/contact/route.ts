import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/email";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  const data = await request.json();
  const parsed = contactSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues?.[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { name, email, message } = parsed.data;
  const html = `
    <h1>New contact message</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;

  await sendMail({
    to: process.env.SMTP_USER ?? email,
    subject: `Contact request from ${name}`,
    html,
  });

  return NextResponse.json({ message: "Your message was sent successfully." }, { status: 200 });
}
