import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/serverAuth";

export async function requireAdminPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/admin/login");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}
