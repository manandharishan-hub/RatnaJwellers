import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { compare } from "bcryptjs";

export async function POST(request: Request) {
  const data = await request.json();
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues?.[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  await connectDB();
  const user = await UserModel.findOne({ email: parsed.data.email }).select("+password role email name isVerified isBlocked");
  if (!user) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }
  if (user.isBlocked) {
    return NextResponse.json({ message: "Your account has been blocked." }, { status: 403 });
  }
  if (!user.isVerified) {
    return NextResponse.json({ message: "Please verify your email before signing in." }, { status: 401 });
  }
  const isValid = await user.comparePassword(parsed.data.password);
  if (!isValid) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  return NextResponse.json({ user: { name: user.name, email: user.email, role: user.role } }, { status: 200 });
}
