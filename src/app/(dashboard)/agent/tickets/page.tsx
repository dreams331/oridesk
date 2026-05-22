import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDateTime, getStatusColour, getPriorityColour, getSentimentColour } from "@/lib/utils";
import { Ticket, MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function AgentTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") redirect("/login");

  const { status } = await searchParams;

  const agent = await prisma.agentProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!agent) redirect("/login");

  const where: Record<string, unknown> = { agentId: agent.id };
  if (status) where.status = status;

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { companyName: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const statusOptions = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
          <p className="text-slate-500 mt-1">Support tickets assigned to you</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-xl px-4 py-2">
          <Ticket className="w-4 h-4" />
          <span className="font-semibold text-slate-900">{tickets.length}</span> total
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/agent/tickets"
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
            !status ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          All
        </Link>
        {statusOptions.map((s) => (
          <Link
            key={s}
            href={`/agent/tickets?status=${s}`}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              status === s ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">No tickets found</h3>
          <p className="text-slate-500 text-sm">
            {status ? "Try changing the filter." : "You have no tickets assigned yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-6 py-4">Subject</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Customer</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Client</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Priority</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Sentiment</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-4">Created</th>
                <th className="px-4 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{ticket.subject}</p>
                      {ticket.messages[0] && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                          {ticket.messages[0].content}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-slate-700 font-medium">{ticket.maskedName}</p>
                    <p className="text-xs text-slate-400">{ticket.maskedEmail}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-slate-600">{ticket.client.companyName}</p>
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
                    <p className="text-xs text-slate-500 whitespace-nowrap">{formatDateTime(ticket.createdAt)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/agent/tickets/${ticket.id}`}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Open
                    </Link>
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
