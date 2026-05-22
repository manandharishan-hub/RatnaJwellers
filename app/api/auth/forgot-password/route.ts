import { NextResponse } from "next/server";
import { emailSchema } from "@/lib/validation";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { createToken } from "@/lib/tokens";
import { buildResetPasswordEmail, sendMail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = emailSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues?.[0]?.message ?? "Invalid input." }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findOne({ email: parsed.data.email });
    if (user) {
      const token = await createToken({ email: user.email }, "1h");
      const emailContent = buildResetPasswordEmail(token, user.email);
      await sendMail({ to: user.email, subject: emailContent.subject, html: emailContent.html });
    }

    return NextResponse.json({ message: "If that account exists, a password reset email has been sent." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password email failed", error);
    return NextResponse.json({ message: "Unable to send password reset email right now. Please try again later." }, { status: 500 });
  }
}
