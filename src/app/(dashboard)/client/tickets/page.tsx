import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDateTime, getStatusColour, getPriorityColour, getSentimentColour } from "@/lib/utils";
import { Ticket, Filter, MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function ClientTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") redirect("/login");

  const { status, priority } = await searchParams;

  const client = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!client) redirect("/client/onboarding");

  const where: Record<string, unknown> = { clientId: client.id };
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      agent: { include: { user: { select: { name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
  const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tickets</h1>
          <p className="text-slate-500 mt-1">All support tickets from your customers</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-2">
          <Ticket className="w-4 h-4" />
          <span className="font-semibold text-slate-900">{tickets.length}</span> total
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Filter className="w-4 h-4" />
          Filter by:
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/client/tickets"
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              !status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Status
          </Link>
          {statusOptions.map((s) => (
            <Link
              key={s}
              href={`/client/tickets?status=${s}${priority ? `&priority=${priority}` : ""}`}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                status === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s.replace("_", " ")}
            </Link>
          ))}
        </div>

        <div className="w-px h-5 bg-slate-200" />

        {/* Priority filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/client/tickets${status ? `?status=${status}` : ""}`}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              !priority ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Priority
          </Link>
          {priorityOptions.map((p) => (
            <Link
              key={p}
              href={`/client/tickets?priority=${p}${status ? `&status=${status}` : ""}`}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                priority === p ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      </div>

      {/* Tickets list */}
      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">No tickets found</h3>
          <p className="text-slate-500 text-sm">
            {status || priority ? "Try changing your filters." : "Tickets will appear here once customers contact you."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Subject</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Customer</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Priority</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Sentiment</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Agent</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/client/tickets/${ticket.id}`} className="block">
                      <p className="font-medium text-slate-900 text-sm hover:text-blue-600">{ticket.subject}</p>
                      {ticket.messages[0] && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                          {ticket.messages[0].content}
                        </p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-slate-700 font-medium">{ticket.customerName}</p>
                    <p className="text-xs text-slate-400">{ticket.customerEmail}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColour(ticket.status)}`}>
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPriorityColour(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {ticket.sentiment ? (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getSentimentColour(ticket.sentiment)}`}>
                        {ticket.sentiment}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {ticket.agent ? (
                      <p className="text-sm text-slate-700">{ticket.agent.user.name}</p>
                    ) : (
                      <span className="text-xs text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs text-slate-500 whitespace-nowrap">{formatDateTime(ticket.createdAt)}</p>
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
