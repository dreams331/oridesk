import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDateTime } from "@/lib/utils";
import { Users, Star, UserCheck } from "lucide-react";
import AdminAgentActions from "./actions";

export default async function AdminAgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const { status } = await searchParams;

  const where = status === "pending"
    ? { status: "PENDING" as const }
    : status === "active"
    ? { status: "ACTIVE" as const }
    : status === "suspended"
    ? { status: "SUSPENDED" as const }
    : {};

  const agents = await prisma.agentProfile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { clientAssignments: true } },
    },
  });

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Active", value: "active" },
    { label: "Suspended", value: "suspended" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Agents</h1>
          <p className="text-slate-500 mt-1">Manage all support agents on the platform</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-2">
          <Users className="w-4 h-4" />
          <span className="font-semibold text-slate-900">{agents.length}</span> shown
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {statusOptions.map((opt) => (
          <a
            key={opt.value}
            href={opt.value ? `/admin/agents?status=${opt.value}` : "/admin/agents"}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              (status || "") === opt.value
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </a>
        ))}
      </div>

      {agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">No agents found</h3>
          <p className="text-slate-500 text-sm">Try changing the filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Agent</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">CareScore™</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Tickets</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Clients</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Online</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Joined</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {agent.user.name?.charAt(0) || "A"}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{agent.user.name}</p>
                        <p className="text-xs text-slate-400">{agent.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      agent.status === "ACTIVE" ? "text-green-700 bg-green-100" :
                      agent.status === "PENDING" ? "text-yellow-700 bg-yellow-100" :
                      "text-red-700 bg-red-100"
                    }`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-sm font-medium text-slate-700">{Math.round(agent.careScore)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-700">
                      <span className="font-medium">{agent.resolvedTickets}</span>
                      <span className="text-slate-400">/{agent.totalTickets}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-slate-700">{agent._count.clientAssignments}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${agent.isOnline ? "bg-green-400" : "bg-slate-300"}`} />
                      <span className="text-xs text-slate-500">{agent.isOnline ? "Yes" : "No"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-500 whitespace-nowrap">{formatDateTime(agent.createdAt)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <AdminAgentActions agentId={agent.id} currentStatus={agent.status} />
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
