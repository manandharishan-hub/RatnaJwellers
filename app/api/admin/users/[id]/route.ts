import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import UserModel from "@/models/User";
import { logAdminAction } from "@/lib/audit";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = await requireSuperAdminApi(request);
  if (token instanceof NextResponse) {
    return token;
  }
  const body = await request.json();
  const { name, email, role, isBlocked } = body as {
    name?: string;
    email?: string;
    role?: string;
    isBlocked?: boolean;
  };

  await connectDB();
  const user = await UserModel.findById(id).select("name email role isBlocked");
  if (!user) {
    return NextResponse.json({ message: "Admin user not found." }, { status: 404 });
  }

  if (token.id === id) {
    if (role && role !== user.role) {
      return NextResponse.json({ message: "You cannot change your own role." }, { status: 403 });
    }
    if (isBlocked) {
      return NextResponse.json({ message: "You cannot deactivate your own account." }, { status: 403 });
    }
  }

  if (role === "admin" && user.role === "superadmin") {
    const superadminCount = await UserModel.countDocuments({ role: "superadmin" });
    if (superadminCount <= 1) {
      return NextResponse.json({ message: "Cannot demote the last superadmin." }, { status: 400 });
    }
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (role && ["admin", "superadmin"].includes(role)) user.role = role as any;
  if (typeof isBlocked === "boolean") user.isBlocked = isBlocked;
  await user.save();

  await logAdminAction({
    adminId: token.id ?? "",
    adminName: token.name ?? "",
    adminEmail: token.email ?? "",
    action: "Updated admin user",
    resource: "User",
    resourceId: user._id.toString(),
    ip: "",
  });

  return NextResponse.json({ message: "Admin user updated.", user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, isBlocked: user.isBlocked } });
}
