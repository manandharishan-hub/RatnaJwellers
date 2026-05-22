import { connectDB } from "@/lib/mongodb";
import AuditLogModel from "@/models/AuditLog";

export interface AuditLogEntry {
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  ip?: string;
  metadata?: Record<string, unknown>;
}

export async function logAdminAction(entry: AuditLogEntry) {
  await connectDB();
  await AuditLogModel.create({
    adminId: entry.adminId,
    adminName: entry.adminName,
    adminEmail: entry.adminEmail,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    ip: entry.ip ?? "",
    metadata: entry.metadata ?? {},
  });
}
