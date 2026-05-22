"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, User, Phone, MapPin, Star } from "lucide-react";

interface AgentProfile {
  country: string | null;
  phone: string | null;
  bio: string | null;
  careScore: number;
  totalTickets: number;
  resolvedTickets: number;
  status: string;
  user: { name: string; email: string };
}

export default function AgentSettingsPage() {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [form, setForm] = useState({ country: "", phone: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/agents/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({
          country: data.country || "",
          phone: data.phone || "",
          bio: data.bio || "",
        });
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/agents/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your agent profile</p>
      </div>

      {/* Stats */}
      {profile && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <p className="text-2xl font-bold text-slate-900">{profile.totalTickets}</p>
            <p className="text-sm text-slate-500 mt-0.5">Total Tickets</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <p className="text-2xl font-bold text-slate-900">{profile.resolvedTickets}</p>
            <p className="text-sm text-slate-500 mt-0.5">Resolved</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-5 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <p className="text-2xl font-bold text-slate-900">{Math.round(profile.careScore)}</p>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">CareScore™</p>
          </div>
        </div>
      )}

      {/* Profile form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white text-lg font-bold">
            {profile?.user.name?.charAt(0) || "A"}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{profile?.user.name}</p>
            <p className="text-sm text-slate-500">{profile?.user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <MapPin className="w-4 h-4 inline mr-1.5" />
              Country
            </label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
              placeholder="e.g. United Kingdom"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Phone className="w-4 h-4 inline mr-1.5" />
              Phone Number
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+44 7700 900000"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <User className="w-4 h-4 inline mr-1.5" />
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Tell clients a bit about yourself and your expertise…"
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
