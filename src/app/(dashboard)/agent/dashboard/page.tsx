import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Clock, MessageSquare, Star, TrendingUp, AlertCircle } from "lucide-react";
import { getStatusColour, getPriorityColour, getSentimentColour, timeAgo } from "@/lib/utils";

export default async function AgentDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") redirect("/login");

  const agent = await prisma.agentProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      tickets: {
        orderBy: { updatedAt: "desc" },
        take: 20,
        include: { client: { select: { companyName: true, brandColor: true } } },
      },
    },
  });

  if (!agent) redirect("/login");

  if (agent.status === "PENDING") {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application under review</h2>
          <p className="text-slate-500">
            Your agent application is being reviewed. You&apos;ll receive an email once approved — usually within 24–48 hours.
          </p>
        </div>
      </div>
    );
  }

  const openTickets = agent.tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS");
  const resolvedToday = agent.tickets.filter((t) => {
    if (t.status !== "RESOLVED" || !t.resolvedAt) return false;
    const today = new Date();
    return new Date(t.resolvedAt).toDateString() === today.toDateString();
  });
  const urgentTickets = agent.tickets.filter((t) => (t.priority === "URGENT" || t.priority === "HIGH") && t.status !== "RESOLVED");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">Here&apos;s your queue for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Open / In Progress", value: openTickets.length, icon: MessageSquare, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
          { label: "Resolved Today", value: resolvedToday.length, icon: CheckCircle, color: "bg-green-50 text-green-600", border: "border-green-100" },
          { label: "Urgent / High", value: urgentTickets.length, icon: AlertCircle, color: "bg-red-50 text-red-600", border: "border-red-100" },
          { label: "My CareScore™", value: agent.careScore ? `${Math.round(agent.careScore)}/100` : "—", icon: Star, color: "bg-yellow-50 text-yellow-600", border: "border-yellow-100" },
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

      {/* SafeAgent notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <p className="text-sm text-slate-700">
          <strong>SafeAgent™ is active.</strong> Customer names and emails are masked to protect privacy. This keeps your clients&apos; data secure and you protected.
        </p>
      </div>

      {/* Ticket queue */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Your Ticket Queue</h2>
          <Link href="/agent/tickets" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all →</Link>
        </div>
        {agent.tickets.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">No tickets assigned yet</p>
            <p className="text-slate-400 text-sm mt-1">Tickets from your assigned clients will appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {agent.tickets.slice(0, 15).map((ticket) => (
              <Link key={ticket.id} href={`/agent/tickets/${ticket.id}`} className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors">
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: ticket.client.brandColor || "#3B82F6" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-slate-900 text-sm">{ticket.subject}</span>
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
                    {ticket.client.companyName} · {ticket.maskedName} · {timeAgo(ticket.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
