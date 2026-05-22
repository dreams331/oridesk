import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { Building2, Users, Ticket, Globe } from "lucide-react";

export default async function AdminClientsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const clients = await prisma.clientProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { tickets: true, agentAssignments: true } },
    },
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">All businesses using OriDesk</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-2">
          <Building2 className="w-4 h-4" />
          <span className="font-semibold text-slate-900">{clients.length}</span> total
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">No clients yet</h3>
          <p className="text-slate-500 text-sm">Clients will appear here when they register.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Company</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Owner</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Industry</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Tickets</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Agents</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: client.brandColor }}
                      >
                        {client.companyName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{client.companyName}</p>
                        {client.website && (
                          <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 flex items-center gap-0.5">
                            <Globe className="w-3 h-3" />{client.website.replace(/https?:\/\//, "")}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-slate-700 font-medium">{client.user.name}</p>
                    <p className="text-xs text-slate-400">{client.user.email}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-slate-600">{client.industry || "—"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-700">
                      <Ticket className="w-3.5 h-3.5 text-slate-400" />
                      {client._count.tickets}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 text-sm text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {client._count.agentAssignments}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${client.isActive ? "text-green-700 bg-green-100" : "text-slate-600 bg-slate-100"}`}>
                      {client.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-500 whitespace-nowrap">{formatDateTime(client.createdAt)}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
