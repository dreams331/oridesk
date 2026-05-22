"use client";

import { useEffect, useState } from "react";
import { Code, Copy, Check, Palette, Globe, Loader2, Save } from "lucide-react";

interface ClientProfile {
  companyName: string;
  website: string | null;
  brandColor: string;
  brandTone: string | null;
  widgetKey: string;
}

export default function ClientSettingsPage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [form, setForm] = useState({ website: "", brandColor: "#3B82F6", brandTone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/clients/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setForm({
          website: data.website || "",
          brandColor: data.brandColor || "#3B82F6",
          brandTone: data.brandTone || "",
        });
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/clients/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function copyWidgetCode() {
    if (!profile) return;
    const code = `<script src="${window.location.origin}/widget.js" data-widget-key="${profile.widgetKey}" defer></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const widgetSnippet = `<script
  src="${typeof window !== "undefined" ? window.location.origin : ""}/widget.js"
  data-widget-key="${profile?.widgetKey}"
  defer
></script>`;

  const toneOptions = [
    { value: "", label: "Default (Professional)" },
    { value: "friendly", label: "Friendly & Warm" },
    { value: "formal", label: "Formal & Corporate" },
    { value: "casual", label: "Casual & Relaxed" },
    { value: "empathetic", label: "Empathetic & Caring" },
    { value: "concise", label: "Concise & Direct" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your widget and account preferences</p>
      </div>

      {/* Widget Embed Code */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Code className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Widget Embed Code</h2>
            <p className="text-sm text-slate-500">Add this snippet to your website&apos;s &lt;head&gt; or &lt;body&gt;</p>
          </div>
        </div>

        <div className="relative bg-slate-900 rounded-xl p-4 font-mono text-sm text-green-400 overflow-x-auto">
          <pre className="whitespace-pre-wrap break-all">{widgetSnippet}</pre>
          <button
            onClick={copyWidgetCode}
            className="absolute top-3 right-3 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>

        {copied && (
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            <Check className="w-4 h-4" /> Copied to clipboard!
          </p>
        )}

        <div className="mt-4 bg-blue-50 rounded-xl p-4">
          <p className="text-sm font-medium text-blue-900 mb-1">Your Widget Key</p>
          <p className="font-mono text-blue-700 text-sm break-all">{profile?.widgetKey}</p>
        </div>
      </div>

      {/* Branding & Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Branding & Preferences</h2>
            <p className="text-sm text-slate-500">Customise how OriDesk appears to your customers</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Globe className="w-4 h-4 inline mr-1.5" />
              Website URL
            </label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
              placeholder="https://yourcompany.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Brand Colour */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Brand Colour
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.brandColor}
                onChange={(e) => setForm((p) => ({ ...p, brandColor: e.target.value }))}
                className="w-12 h-10 rounded-xl border border-slate-200 cursor-pointer p-1"
              />
              <input
                type="text"
                value={form.brandColor}
                onChange={(e) => setForm((p) => ({ ...p, brandColor: e.target.value }))}
                placeholder="#3B82F6"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div
                className="w-10 h-10 rounded-xl border border-slate-200 shrink-0"
                style={{ backgroundColor: form.brandColor }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">This colour is used for the chat widget button and header.</p>
          </div>

          {/* Brand Tone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              AI Reply Tone
            </label>
            <select
              value={form.brandTone}
              onChange={(e) => setForm((p) => ({ ...p, brandTone: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {toneOptions.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1.5">Controls how AI-generated reply suggestions sound.</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
