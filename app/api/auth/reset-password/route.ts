import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { verifyToken } from "@/lib/tokens";
import { resetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const data = await request.json();
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues?.[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { token, email, password } = parsed.data;
  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    return NextResponse.json({ message: "Reset token is invalid or expired." }, { status: 401 });
  }

  if (payload.email !== email) {
    return NextResponse.json({ message: "Token payload does not match email." }, { status: 403 });
  }

  await connectDB();
  const user = await UserModel.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  user.password = password;
  await user.save();

  return NextResponse.json({ message: "Password has been reset successfully." }, { status: 200 });
}
