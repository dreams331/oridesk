import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BarChart3, MessageSquare, Users, CheckCircle, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { formatDateTime, getStatusColour, getPriorityColour, getSentimentColour } from "@/lib/utils";
import Link from "next/link";

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") redirect("/login");

  const client = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      tickets: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { agent: { include: { user: true } } },
      },
    },
  });

  if (!client) redirect("/client/onboarding");

  const tickets = client.tickets;
  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const inProgressCount = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;
  const urgentCount = tickets.filter((t) => t.priority === "URGENT" || t.priority === "HIGH").length;
  const avgScore = tickets.filter((t) => t.careScore).reduce((acc, t) => acc + (t.careScore || 0), 0) / (tickets.filter((t) => t.careScore).length || 1);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">{client.companyName} · Live dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Open", value: openCount, icon: MessageSquare, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
          { label: "In Progress", value: inProgressCount, icon: Clock, color: "bg-yellow-50 text-yellow-600", border: "border-yellow-100" },
          { label: "Resolved", value: resolvedCount, icon: CheckCircle, color: "bg-green-50 text-green-600", border: "border-green-100" },
          { label: "Urgent/High", value: urgentCount, icon: AlertCircle, color: "bg-red-50 text-red-600", border: "border-red-100" },
          { label: "CareScore™", value: avgScore ? `${Math.round(avgScore)}/100` : "—", icon: TrendingUp, color: "bg-purple-50 text-purple-600", border: "border-purple-100" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white rounded-2xl border ${stat.border} p-5`}>
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Widget embed reminder */}
      {tickets.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">Waiting for your first ticket 🚀</h3>
            <p className="text-slate-600 text-sm mb-3">
              Make sure your live chat widget is on your website. Once a customer sends a message, it will appear here.
            </p>
            <Link href="/client/settings" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Get widget code →
            </Link>
          </div>
        </div>
      )}

      {/* Recent Tickets */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Recent Tickets</h2>
          <Link href="/client/tickets" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all →
          </Link>
        </div>
        {tickets.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">No tickets yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/client/tickets/${ticket.id}`}
                className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-slate-900 text-sm truncate">{ticket.subject}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColour(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColour(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    {ticket.sentiment && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSentimentColour(ticket.sentiment)}`}>
                        {ticket.sentiment}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {ticket.maskedName} · {formatDateTime(ticket.createdAt)}
                    {ticket.agent && ` · Agent: ${ticket.agent.user.name}`}
                  </p>
                </div>
                {ticket.careScore && (
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600">{Math.round(ticket.careScore)}</span>
                    <p className="text-xs text-slate-400">score</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
