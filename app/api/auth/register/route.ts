import { NextResponse } from "next/server";
import { registerSchema } from "@/lib/validation";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { createToken } from "@/lib/tokens";
import { buildVerificationEmail, sendMail } from "@/lib/email";

export async function POST(request: Request) {
  const data = await request.json();
  const parsed = registerSchema.safeParse(data);

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues?.[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  await connectDB();

  const existing = await UserModel.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: "An account already exists with that email." }, { status: 409 });
  }

  const user = await UserModel.create({ name, email, password, role: "customer", isVerified: false, isBlocked: false, addresses: [], wishlist: [] });
  const token = await createToken({ email: user.email }, "24h");
  const emailContent = buildVerificationEmail(token, user.email);
  await sendMail({ to: user.email, subject: emailContent.subject, html: emailContent.html });

  return NextResponse.json({ message: "Registration completed. Please check your email to verify your account." }, { status: 201 });
}
