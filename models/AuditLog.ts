import mongoose, { Document, Model } from "mongoose";

export interface AuditLogDoc extends Document {
  adminId: string;
  adminName: string;
  adminEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  ip: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new mongoose.Schema<AuditLogDoc>(
  {
    adminId: { type: String, required: true },
    adminName: { type: String, required: true },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true, trim: true },
    resource: { type: String, required: true, trim: true },
    resourceId: { type: String, required: true, trim: true },
    ip: { type: String, trim: true, default: "" },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

const AuditLogModel = (mongoose.models.AuditLog as Model<AuditLogDoc>) || mongoose.model<AuditLogDoc>("AuditLog", auditLogSchema, "auditlogs");
export default AuditLogModel;
