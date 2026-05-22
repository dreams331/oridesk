"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, CheckCircle, ArrowRight, Upload, Palette, Globe, Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, title: "Company Profile", description: "Tell us about your business" },
  { id: 2, title: "Brand Settings", description: "Customise your widget" },
  { id: 3, title: "Knowledge Base", description: "Add your FAQs and policies" },
  { id: 4, title: "Get Your Widget", description: "Embed on your website" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [widgetKey, setWidgetKey] = useState("");
  const [form, setForm] = useState({
    website: "",
    brandColor: "#3B82F6",
    brandTone: "",
    kbTitle: "",
    kbContent: "",
    kbCategory: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function saveProfile() {
    setLoading(true);
    const res = await fetch("/api/clients/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        website: form.website,
        brandColor: form.brandColor,
        brandTone: form.brandTone,
      }),
    });
    const data = await res.json();
    setWidgetKey(data.widgetKey || "");
    setLoading(false);
    setStep(4);
  }

  async function saveKnowledgeBase() {
    if (!form.kbTitle || !form.kbContent) { setStep(3 + 1); return; }
    setLoading(true);
    await fetch("/api/clients/knowledge-base", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.kbTitle,
        content: form.kbContent,
        category: form.kbCategory,
      }),
    });
    setLoading(false);
    await saveProfile();
  }

  const widgetCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL || "https://oridesk.com"}/widget.js" data-key="${widgetKey}"></script>`;

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 pt-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">OriDesk</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Let&apos;s get you set up</h1>
          <p className="text-slate-500">You&apos;ll be live in under 10 minutes.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    step > s.id
                      ? "bg-green-500 text-white"
                      : step === s.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${step === s.id ? "text-blue-600 font-medium" : "text-slate-400"}`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 sm:w-20 h-px mx-1 sm:mx-2 ${step > s.id ? "bg-green-500" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          {/* Step 1: Company Profile */}
          {step === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Company Profile</h2>
                  <p className="text-slate-500 text-sm">Basic info about your business</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company website</label>
                  <input
                    name="website"
                    type="url"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://yourcompany.com"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Brand Settings */}
          {step === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Brand Settings</h2>
                  <p className="text-slate-500 text-sm">Customise your live chat widget</p>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand colour</label>
                  <div className="flex items-center gap-3">
                    <input
                      name="brandColor"
                      type="color"
                      value={form.brandColor}
                      onChange={handleChange}
                      className="w-14 h-12 rounded-lg border border-slate-200 cursor-pointer"
                    />
                    <input
                      name="brandColor"
                      type="text"
                      value={form.brandColor}
                      onChange={handleChange}
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand tone / voice</label>
                  <select
                    name="brandTone"
                    value={form.brandTone}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select tone</option>
                    <option value="professional">Professional & Formal</option>
                    <option value="friendly">Friendly & Conversational</option>
                    <option value="empathetic">Empathetic & Supportive</option>
                    <option value="direct">Direct & Efficient</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Knowledge Base */}
          {step === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Knowledge Base</h2>
                  <p className="text-slate-500 text-sm">Add one FAQ or policy — you can add more later</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                  <input
                    name="kbTitle"
                    type="text"
                    value={form.kbTitle}
                    onChange={handleChange}
                    placeholder="e.g. Refund Policy"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Content</label>
                  <textarea
                    name="kbContent"
                    value={form.kbContent}
                    onChange={handleChange}
                    rows={5}
                    placeholder="e.g. We offer a 30-day money back guarantee on all orders..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select
                    name="kbCategory"
                    value={form.kbCategory}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="refunds">Refunds & Returns</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="account">Account & Billing</option>
                    <option value="product">Product Info</option>
                    <option value="general">General FAQ</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors">
                  Back
                </button>
                <button
                  onClick={saveKnowledgeBase}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Save & Continue <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
              <button onClick={() => saveProfile()} className="w-full mt-2 text-slate-500 hover:text-slate-700 text-sm py-2">
                Skip for now
              </button>
            </div>
          )}

          {/* Step 4: Widget */}
          {step === 4 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">You&apos;re all set! 🎉</h2>
                <p className="text-slate-500">Paste this code before the closing &lt;/body&gt; tag on your website</p>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 mb-6">
                <code className="text-green-400 text-sm break-all">{widgetCode}</code>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(widgetCode)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors mb-4"
              >
                Copy widget code
              </button>
              <button
                onClick={() => router.push("/client/dashboard")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                Go to dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
