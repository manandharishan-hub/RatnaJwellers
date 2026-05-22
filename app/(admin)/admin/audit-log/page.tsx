import { connectDB } from "@/lib/mongodb";
import AuditLogModel from "@/models/AuditLog";

async function getAuditLogs() {
  await connectDB();
  return AuditLogModel.find().sort({ createdAt: -1 }).limit(50).lean();
}

export default async function AdminAuditLogPage() {
  const logs = await getAuditLogs();

  return (
    <div className="px-6 py-10 md:px-10 lg:px-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[#0A1628]">Audit log</h1>
        <p className="text-slate-600">Review administrative activity and exported event history.</p>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Admin</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Resource</th>
              <th className="px-6 py-4">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {logs.map((log) => (
              <tr key={log._id.toString()}>
                <td className="px-6 py-4">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4">{log.adminName} ({log.adminEmail})</td>
                <td className="px-6 py-4">{log.action}</td>
                <td className="px-6 py-4">{log.resource} / {log.resourceId}</td>
                <td className="px-6 py-4">{log.ip || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
