import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return (session?.user ?? null) as SessionUser | null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { user: null, response: NextResponse.json({ message: "Authentication required." }, { status: 401 }) };
  }
  if (user.role === "admin") {
    return { user: null, response: NextResponse.json({ message: "User access required." }, { status: 403 }) };
  }
  return { user, response: null };
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { user: null, response: NextResponse.json({ message: "Authentication required." }, { status: 401 }) };
  }
  if (user.role !== "admin") {
    return { user: null, response: NextResponse.json({ message: "Admin access required." }, { status: 403 }) };
  }
  return { user, response: null };
}

export function isAdmin(user: SessionUser | null) {
  return user?.role === "admin";
}

export function isRegularUser(user: SessionUser | null) {
  return Boolean(user?.id) && user?.role !== "admin";
}
