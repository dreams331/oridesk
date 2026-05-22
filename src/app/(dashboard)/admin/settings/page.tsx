import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Shield, Activity, Database, Users, Building2, Ticket } from "lucide-react";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [totalUsers, totalClients, totalAgents, totalTickets, totalMessages, totalKBItems] = await Promise.all([
    prisma.user.count(),
    prisma.clientProfile.count(),
    prisma.agentProfile.count(),
    prisma.ticket.count(),
    prisma.message.count(),
    prisma.knowledgeBase.count(),
  ]);

  const stats = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Clients", value: totalClients, icon: Building2, color: "text-purple-600 bg-purple-50" },
    { label: "Agents", value: totalAgents, icon: Users, color: "text-green-600 bg-green-50" },
    { label: "Tickets", value: totalTickets, icon: Ticket, color: "text-yellow-600 bg-yellow-50" },
    { label: "Messages", value: totalMessages, icon: Activity, color: "text-orange-600 bg-orange-50" },
    { label: "KB Articles", value: totalKBItems, icon: Database, color: "text-slate-600 bg-slate-50" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 mt-1">System overview and configuration</p>
      </div>

      {/* Admin identity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold">
            {session.user.name?.charAt(0) || "A"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 text-lg">{session.user.name}</p>
              <div className="flex items-center gap-1 bg-red-50 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full border border-red-200">
                <Shield className="w-3 h-3" />
                Administrator
              </div>
            </div>
            <p className="text-slate-500">{session.user.email}</p>
          </div>
        </div>
      </div>

      {/* Platform stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-500" />
          Platform Statistics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-slate-50 rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Platform info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-slate-500" />
          System Info
        </h2>
        <div className="space-y-3">
          {[
            { label: "Product", value: "OriDesk" },
            { label: "Version", value: "0.1.0" },
            { label: "Organisation", value: "Ori Global Ltd" },
            { label: "Database", value: "PostgreSQL (Prisma ORM)" },
            { label: "AI Engine", value: "OpenAI GPT" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-500">{item.label}</span>
              <span className="text-sm font-medium text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
