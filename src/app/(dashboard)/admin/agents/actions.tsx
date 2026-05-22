"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Ban, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminAgentActions({
  agentId,
  currentStatus,
}: {
  agentId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);
    await fetch("/api/admin/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, status }),
    });
    setLoading(false);
    router.refresh();
  }

  if (loading) return <Loader2 className="w-4 h-4 animate-spin text-slate-400" />;

  return (
    <div className="flex items-center gap-1">
      {currentStatus !== "ACTIVE" && (
        <button
          onClick={() => updateStatus("ACTIVE")}
          className="flex items-center gap-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Approve
        </button>
      )}
      {currentStatus !== "SUSPENDED" && (
        <button
          onClick={() => updateStatus("SUSPENDED")}
          className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Ban className="w-3.5 h-3.5" />
          Suspend
        </button>
      )}
      {currentStatus === "SUSPENDED" && (
        <button
          onClick={() => updateStatus("PENDING")}
          className="flex items-center gap-1 text-xs bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reinstate
        </button>
      )}
    </div>
  );
}
