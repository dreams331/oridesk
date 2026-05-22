"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Send, Zap, CheckCircle, Clock, AlertCircle,
  RefreshCw, ArrowLeft, Shield, Loader2
} from "lucide-react";
import { timeAgo, getStatusColour, getPriorityColour, getSentimentColour, cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isFromCustomer: boolean;
  isAiSuggestion: boolean;
  createdAt: string;
  agent?: { user: { name: string } };
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  channel: string;
  sentiment: string;
  aiSuggestion: string;
  maskedName: string;
  maskedEmail: string;
  careScore: number | null;
  createdAt: string;
  client: { companyName: string; brandColor: string; brandTone: string };
  messages: Message[];
}

export default function AgentTicketPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshingAI, setRefreshingAI] = useState(false);
  const [resolving, setResolving] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchTicket() {
    const res = await fetch(`/api/tickets/${id}`);
    const data = await res.json();
    setTicket(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchTicket();
    const interval = setInterval(fetchTicket, 15000); // auto-refresh every 15s
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);

    await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reply", content: reply }),
    });

    setReply("");
    setSending(false);
    await fetchTicket();
  }

  async function refreshAISuggestion() {
    if (!ticket) return;
    setRefreshingAI(true);
    const lastCustomerMsg = [...ticket.messages].reverse().find((m) => m.isFromCustomer);
    await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ai_suggest", customerMessage: lastCustomerMsg?.content || ticket.subject }),
    });
    setRefreshingAI(false);
    await fetchTicket();
  }

  async function resolveTicket() {
    setResolving(true);
    await fetch(`/api/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "resolve" }),
    });
    setResolving(false);
    await fetchTicket();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!ticket) return <div className="p-8 text-slate-500">Ticket not found.</div>;

  const isResolved = ticket.status === "RESOLVED" || ticket.status === "CLOSED";

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 mt-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-slate-900">{ticket.subject}</h1>
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
              <p className="text-xs text-slate-400 mt-1">
                {ticket.client.companyName} · {timeAgo(ticket.createdAt)}
              </p>
            </div>
          </div>
          {!isResolved && (
            <button
              onClick={resolveTicket}
              disabled={resolving}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex-shrink-0"
            >
              {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Resolve
            </button>
          )}
          {isResolved && ticket.careScore && (
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{Math.round(ticket.careScore)}<span className="text-sm font-normal text-slate-400">/100</span></p>
              <p className="text-xs text-slate-400">CareScore™</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversation */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* SafeAgent banner */}
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 flex items-center gap-2 flex-shrink-0">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs text-blue-700">
              <strong>SafeAgent™ active</strong> — Showing: <strong>{ticket.maskedName}</strong> · <strong>{ticket.maskedEmail}</strong>
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {ticket.messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.isFromCustomer ? "justify-start" : "justify-end")}>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
                  msg.isFromCustomer
                    ? "bg-white border border-slate-200 text-slate-800"
                    : "bg-blue-600 text-white"
                )}>
                  {!msg.isFromCustomer && (
                    <p className="text-xs text-blue-200 mb-1 font-medium">
                      {msg.agent?.user.name || "Agent"}
                    </p>
                  )}
                  {msg.isFromCustomer && (
                    <p className="text-xs text-slate-400 mb-1 font-medium">{ticket.maskedName}</p>
                  )}
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className={cn("text-xs mt-1.5", msg.isFromCustomer ? "text-slate-400" : "text-blue-200")}>
                    {timeAgo(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          {!isResolved && (
            <div className="border-t border-slate-200 p-4 bg-white flex-shrink-0">
              <form onSubmit={sendReply} className="flex gap-3">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(e); } }}
                  placeholder="Type your reply… (Enter to send, Shift+Enter for new line)"
                  rows={3}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl px-4 flex items-center justify-center transition-colors self-end pb-3 pt-3"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* AI Sidebar */}
        <div className="w-80 border-l border-slate-200 bg-slate-50 flex flex-col overflow-y-auto flex-shrink-0">
          <div className="p-5 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-slate-900 text-sm">AI Co-Pilot</span>
              </div>
              <button onClick={refreshAISuggestion} disabled={refreshingAI} className="text-slate-400 hover:text-slate-600 disabled:text-slate-300">
                <RefreshCw className={cn("w-4 h-4", refreshingAI && "animate-spin")} />
              </button>
            </div>
            <p className="text-xs text-slate-400">AI-suggested reply for this ticket</p>
          </div>

          {ticket.aiSuggestion ? (
            <div className="p-5 flex-1">
              <div className="bg-white border border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-700 leading-relaxed">{ticket.aiSuggestion}</p>
              </div>
              {!isResolved && (
                <button
                  onClick={() => setReply(ticket.aiSuggestion)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Use this reply
                </button>
              )}
            </div>
          ) : (
            <div className="p-5 text-center flex-1 flex flex-col items-center justify-center">
              <Zap className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm">No AI suggestion yet</p>
              <button onClick={refreshAISuggestion} className="text-blue-600 hover:text-blue-700 text-sm mt-2 font-medium">
                Generate one
              </button>
            </div>
          )}

          {/* Ticket info */}
          <div className="p-5 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ticket Info</h3>
            {[
              { label: "Customer", value: ticket.maskedName, icon: Shield },
              { label: "Email", value: ticket.maskedEmail, icon: Shield },
              { label: "Channel", value: ticket.channel.replace("_", " "), icon: Clock },
              { label: "Priority", value: ticket.priority, icon: AlertCircle },
              { label: "Client", value: ticket.client.companyName, icon: Clock },
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-2">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-xs font-medium text-slate-700 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
