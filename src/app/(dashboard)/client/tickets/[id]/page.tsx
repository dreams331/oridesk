"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { timeAgo, getStatusColour, getPriorityColour } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isFromCustomer: boolean;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
  messages: Message[];
  agent: { user: { name: string; email: string } } | null;
}

export default function ClientTicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchTicket() {
    const res = await fetch(`/api/tickets/${id}`);
    const data = await res.json();
    setTicket(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 10000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !ticket) return;
    setSending(true);
    await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reply", content: reply, isFromCustomer: true }),
    });
    setReply("");
    await fetchTicket();
    setSending(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-slate-500">Ticket not found.</div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to tickets
      </button>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{ticket.subject}</h1>
            <p className="text-sm text-slate-500 mt-1">
              From <span className="font-medium text-slate-700">{ticket.customerName}</span> · {timeAgo(ticket.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColour(ticket.status)}`}>
              {ticket.status.replace("_", " ")}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPriorityColour(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
        </div>
        {ticket.agent && (
          <p className="text-sm text-slate-500 mt-3">
            Assigned to <span className="font-medium text-slate-700">{ticket.agent.user.name}</span>
          </p>
        )}
        {!ticket.agent && (
          <p className="text-sm text-slate-400 mt-3 italic">No agent assigned yet</p>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4">
        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Conversation</span>
        </div>
        <div className="p-4 space-y-3 min-h-[200px] max-h-[400px] overflow-y-auto">
          {ticket.messages.length === 0 && (
            <p className="text-center text-slate-400 text-sm py-8">No messages yet.</p>
          )}
          {ticket.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isFromCustomer ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.isFromCustomer
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.isFromCustomer ? "text-blue-200" : "text-slate-400"}`}>
                  {timeAgo(msg.createdAt)}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Reply box */}
        <div className="border-t border-slate-100 p-4">
          <form onSubmit={sendReply} className="flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type a reply..."
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={ticket.status === "CLOSED"}
            />
            <button
              type="submit"
              disabled={sending || !reply.trim() || ticket.status === "CLOSED"}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl px-4 flex items-center justify-center transition-colors"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          {ticket.status === "CLOSED" && (
            <p className="text-xs text-slate-400 mt-2">This ticket is closed and cannot receive new replies.</p>
          )}
        </div>
      </div>
    </div>
  );
}
