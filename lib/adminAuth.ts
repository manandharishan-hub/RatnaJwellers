import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

type AuthToken = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
};

export const ADMIN_ROLES = ["admin", "superadmin"] as const;
export const SUPERADMIN_ROLE = "superadmin";

export function isAdminRole(role?: string): boolean {
  return role === "admin" || role === "superadmin";
}

export function isSuperAdminRole(role?: string): boolean {
  return role === SUPERADMIN_ROLE;
}

export async function getAuthToken(request: Request): Promise<AuthToken | null> {
  return (await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET })) as AuthToken | null;
}

export async function requireAuthApi(request: Request) {
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return token;
}

export async function requireAdminApi(request: Request) {
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminRole(token.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return token;
}

export async function requireSuperAdminApi(request: Request) {
  const token = await getAuthToken(request);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  if (!isSuperAdminRole(token.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return token;
}
