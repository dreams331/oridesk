import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Users, Star, CheckCircle, Clock } from "lucide-react";

export default async function ClientAgentsPage() {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT") redirect("/login");

  const client = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      agentAssignments: {
        include: {
          agent: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });

  if (!client) redirect("/client/onboarding");

  const agents = client.agentAssignments.map((a) => a.agent);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Agents</h1>
        <p className="text-slate-500 mt-1">Support agents assigned to {client.companyName}</p>
      </div>

      {agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">No agents assigned yet</h3>
          <p className="text-slate-500 text-sm">
            Our team will assign dedicated support agents to your account shortly.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold">
                  {agent.user.name?.charAt(0) || "A"}
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${agent.isOnline ? "bg-green-400" : "bg-slate-300"}`} />
                  <span className="text-xs text-slate-500">{agent.isOnline ? "Online" : "Offline"}</span>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900">{agent.user.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{agent.user.email}</p>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-50 rounded-xl p-2">
                  <p className="text-sm font-bold text-slate-900">{agent.totalTickets}</p>
                  <p className="text-xs text-slate-400">Tickets</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2">
                  <p className="text-sm font-bold text-slate-900">{agent.resolvedTickets}</p>
                  <p className="text-xs text-slate-400">Resolved</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-2">
                  <div className="flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <p className="text-sm font-bold text-slate-900">{Math.round(agent.careScore)}</p>
                  </div>
                  <p className="text-xs text-slate-400">Score</p>
                </div>
              </div>

              {agent.bio && (
                <p className="text-xs text-slate-500 mt-4 leading-relaxed">{agent.bio}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats summary */}
      {agents.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">{agents.length}</p>
            <p className="text-sm text-slate-500">Total Agents</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {agents.filter((a) => a.isOnline).length}
            </p>
            <p className="text-sm text-slate-500">Online Now</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <Clock className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-900">
              {agents.reduce((acc, a) => acc + a.resolvedTickets, 0)}
            </p>
            <p className="text-sm text-slate-500">Tickets Resolved</p>
          </div>
        </div>
      )}
    </div>
  );
}
