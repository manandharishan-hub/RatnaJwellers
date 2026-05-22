import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { verifyToken } from "@/lib/tokens";

export async function POST(request: Request) {
  const data = await request.json();
  const { token, email } = data;

  if (!token || !email) {
    return NextResponse.json({ message: "Missing verification token or email." }, { status: 400 });
  }

  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    return NextResponse.json({ message: "Verification link is invalid or expired." }, { status: 401 });
  }

  if (payload.email !== email) {
    return NextResponse.json({ message: "Token payload does not match email." }, { status: 403 });
  }

  await connectDB();
  const user = await UserModel.findOne({ email });
  if (!user) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  if (user.isVerified) {
    return NextResponse.json({ message: "Email already verified." }, { status: 200 });
  }

  user.isVerified = true;
  await user.save();

  return NextResponse.json({ message: "Email verified successfully." }, { status: 200 });
}
