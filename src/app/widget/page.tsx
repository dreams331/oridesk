"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Minimize2, Loader2, Bot, User } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isFromCustomer: boolean;
  isAiSuggestion: boolean;
  createdAt: string;
}

interface WidgetConfig {
  companyName: string;
  brandColor: string;
  widgetKey: string;
}

export default function WidgetPage() {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "chat">("form");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [humanRequested, setHumanRequested] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Get widgetKey from URL query
  const widgetKey = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("key") || ""
    : "";

  useEffect(() => {
    if (!widgetKey) return;
    fetch(`/api/widget/config?key=${widgetKey}`)
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => {});
  }, [widgetKey]);

  useEffect(() => {
    if (!ticketId) return;
    const poll = setInterval(async () => {
      const res = await fetch(`/api/widget/messages?ticketId=${ticketId}`);
      const data = await res.json();
      setMessages(data);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 5000);
    return () => clearInterval(poll);
  }, [ticketId]);

  async function startChat(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, widgetKey, channel: "LIVE_CHAT" }),
    });
    const data = await res.json();
    setTicketId(data.ticketId);
    setMessages([{ id: "1", content: form.message, isFromCustomer: true, isAiSuggestion: false, createdAt: new Date().toISOString() }]);
    setStep("chat");
    setLoading(false);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !ticketId) return;
    setSending(true);
    const newMsg: Message = { id: Date.now().toString(), content: reply, isFromCustomer: true, isAiSuggestion: false, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, newMsg]);
    setReply("");
    await fetch(`/api/widget/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId, content: reply }),
    });
    setSending(false);
  }

  const brandColor = config?.brandColor || "#3B82F6";

  if (!config && widgetKey) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      {/* Chat window */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 overflow-hidden flex flex-col" style={{ height: 480 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ backgroundColor: brandColor }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{config?.companyName || "Support"}</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="text-white/70 text-xs">Online</p>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {step === "form" ? (
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-slate-600 text-sm mb-4">
                Hi there 👋 Fill in your details and we&apos;ll get back to you right away.
              </p>
              <form onSubmit={startChat} className="space-y-3">
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your name"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ "--ring-color": brandColor } as React.CSSProperties}
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="Email address"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                />
                <input
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="How can we help?"
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                />
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us more..."
                  required
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: brandColor }}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start conversation"}
                </button>
              </form>
              <p className="text-center text-xs text-slate-400 mt-4">
                Powered by{" "}
                <a href="https://oridesk.com" target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                  OriDesk
                </a>
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="bg-slate-100 rounded-xl p-3 text-xs text-slate-500 text-center">
                  ✨ AI Assistant is here — ask anything. We&apos;ll connect you to a human if needed.
                </div>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.isFromCustomer ? "items-end" : "items-start"}`}>
                    {!msg.isFromCustomer && (
                      <div className="flex items-center gap-1 mb-0.5 px-1">
                        {msg.isAiSuggestion ? (
                          <><Bot className="w-3 h-3 text-violet-500" /><span className="text-[10px] text-violet-500 font-medium">AI Assistant</span></>
                        ) : (
                          <><User className="w-3 h-3 text-blue-500" /><span className="text-[10px] text-blue-500 font-medium">Agent</span></>
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        msg.isFromCustomer ? "text-white" : "bg-slate-100 text-slate-800"
                      }`}
                      style={msg.isFromCustomer ? { backgroundColor: brandColor } : {}}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {!humanRequested && (
                  <div className="flex justify-center pt-1">
                    <button
                      onClick={async () => {
                        setHumanRequested(true);
                        await fetch("/api/widget/reply", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ ticketId, content: "I'd like to speak with a human agent please." }),
                        });
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
                    >
                      Talk to a human instead
                    </button>
                  </div>
                )}
                {humanRequested && (
                  <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-600 text-center">
                    🙋 Request sent — an agent will join shortly.
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-slate-100 p-3 shrink-0">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !reply.trim()}
                    className="text-white rounded-xl px-3 flex items-center justify-center disabled:opacity-50"
                    style={{ backgroundColor: brandColor }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-105"
        style={{ backgroundColor: brandColor }}
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
