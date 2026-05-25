import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { createToken } from "@/lib/tokens";
import { buildVerificationEmail, sendMail } from "@/lib/email";
import { emailSchema } from "@/lib/validation";
import UserModel from "@/models/User";

export async function POST(request: Request) {
  const parsed = emailSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  await connectDB();
  const email = parsed.data.email.trim().toLowerCase();
  const user = await UserModel.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: "If the account exists, a verification email will be sent." });
  }
  if (user.isVerified) {
    return NextResponse.json({ message: "This account is already verified. You can sign in now." });
  }

  const token = await createToken({ email: user.email }, "24h");
  const emailContent = buildVerificationEmail(token, user.email);
  await sendMail({ to: user.email, subject: emailContent.subject, html: emailContent.html });

  return NextResponse.json({ message: "Verification email sent. Please check your inbox." });
}
