import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Building2, Ticket, TrendingUp, CheckCircle, Clock, AlertCircle, UserCheck } from "lucide-react";
import { formatDateTime, getStatusColour, getPriorityColour } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [totalClients, totalAgents, pendingAgents, tickets] = await Promise.all([
    prisma.clientProfile.count(),
    prisma.agentProfile.count({ where: { status: "ACTIVE" } }),
    prisma.agentProfile.count({ where: { status: "PENDING" } }),
    prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        client: { select: { companyName: true } },
        agent: { include: { user: { select: { name: true } } } },
      },
    }),
  ]);

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;
  const urgentCount = tickets.filter((t) => t.priority === "URGENT").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back — here&apos;s everything happening on OriDesk</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Clients", value: totalClients, icon: Building2, color: "bg-blue-50 text-blue-600", border: "border-blue-100", href: "/admin/clients" },
          { label: "Active Agents", value: totalAgents, icon: Users, color: "bg-green-50 text-green-600", border: "border-green-100", href: "/admin/agents" },
          { label: "Pending Agents", value: pendingAgents, icon: UserCheck, color: "bg-yellow-50 text-yellow-600", border: "border-yellow-100", href: "/admin/agents?status=pending" },
          { label: "Urgent Tickets", value: urgentCount, icon: AlertCircle, color: "bg-red-50 text-red-600", border: "border-red-100", href: "/admin/tickets?priority=urgent" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href} className={`bg-white rounded-2xl border ${stat.border} p-5 hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Ticket pipeline */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Open", value: openCount, icon: Clock, color: "bg-blue-600" },
          { label: "In Progress", value: inProgressCount, icon: TrendingUp, color: "bg-yellow-500" },
          { label: "Resolved", value: resolvedCount, icon: CheckCircle, color: "bg-green-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending agent approvals */}
      {pendingAgents > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-yellow-600" />
            <p className="text-slate-700 font-medium">
              <strong>{pendingAgents}</strong> agent application{pendingAgents > 1 ? "s" : ""} waiting for review
            </p>
          </div>
          <Link href="/admin/agents?status=pending" className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            Review now
          </Link>
        </div>
      )}

      {/* All recent tickets */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Recent Tickets — All Clients</h2>
          <Link href="/admin/tickets" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all →</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {tickets.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500">No tickets yet</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <Link key={ticket.id} href={`/admin/tickets/${ticket.id}`} className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-slate-900 text-sm">{ticket.subject}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColour(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColour(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {ticket.client.companyName} · {ticket.maskedName} · {formatDateTime(ticket.createdAt)}
                    {ticket.agent && ` · ${ticket.agent.user.name}`}
                  </p>
                </div>
                {ticket.careScore && (
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600">{Math.round(ticket.careScore)}</span>
                    <p className="text-xs text-slate-400">score</p>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
