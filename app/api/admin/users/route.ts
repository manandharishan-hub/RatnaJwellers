import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { buildAdminWelcomeEmail, sendMail } from "@/lib/email";
import { logAdminAction } from "@/lib/audit";

export async function GET(request: Request) {
  const token = await requireSuperAdminApi(request);
  if (token instanceof NextResponse) {
    return token;
  }

  await connectDB();
  const admins = await UserModel.find({ role: { $in: ["admin", "superadmin"] } })
    .select("name email role isBlocked createdAt")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ admins });
}

export async function POST(request: Request) {
  const token = await requireSuperAdminApi(request);
  if (token instanceof NextResponse) {
    return token;
  }

  const body = await request.json();
  const { name, email, password, role } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || !email || !password || !role) {
    return NextResponse.json({ message: "Name, email, password, and role are required." }, { status: 400 });
  }
  if (!["admin", "superadmin"].includes(role)) {
    return NextResponse.json({ message: "Role must be admin or superadmin." }, { status: 400 });
  }

  await connectDB();
  const existing = await UserModel.findOne({ email });
  if (existing) {
    return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
  }

  const user = await UserModel.create({
    name,
    email,
    password,
    role,
    isVerified: true,
    isBlocked: false,
  });

  try {
    await sendMail({ to: email, ...buildAdminWelcomeEmail(password, email, name, role) });
  } catch (error) {
    console.warn("Failed to send admin welcome email", error);
  }

  await logAdminAction({
    adminId: token.id ?? "",
    adminName: token.name ?? "",
    adminEmail: token.email ?? "",
    action: "Created admin user",
    resource: "User",
    resourceId: user._id.toString(),
    ip: "",
  });

  return NextResponse.json({ message: "Admin user created.", user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role } }, { status: 201 });
}
