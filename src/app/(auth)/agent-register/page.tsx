"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Eye, EyeOff, Loader2, CheckCircle, Globe } from "lucide-react";

export default function AgentRegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", country: "", phone: "", bio: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/agents/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error || "Something went wrong"); setLoading(false); return; }

    setStep(3);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 text-xl leading-none">OriDesk</p>
              <p className="text-xs text-slate-400 leading-none">Agent Programme</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Step 3 — Success */}
          {step === 3 ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Application received! 🎉</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Thank you for applying to be an OriDesk agent. Our team will review your application and you&apos;ll receive an email within 24–48 hours.
              </p>
              <Link href="/" className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl transition-colors">
                Back to home
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>{s}</div>
                    {s < 2 && <div className={`flex-1 h-px w-8 ${step > s ? "bg-slate-900" : "bg-slate-200"}`} />}
                  </div>
                ))}
                <span className="text-slate-500 text-sm ml-2">{step === 1 ? "Account details" : "About you"}</span>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6">{error}</div>}

              <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleSubmit} className="space-y-4">
                {step === 1 && (
                  <>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Become an agent</h1>
                    <p className="text-slate-500 text-sm mb-4">Join our global network of customer service professionals</p>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                      <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Jane Doe" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@example.com" required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                      <div className="relative">
                        <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Min. 8 characters" required minLength={8} className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">About you</h2>
                    <p className="text-slate-500 text-sm mb-4">Help us match you with the right clients</p>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select name="country" value={form.country} onChange={handleChange} required className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500">
                          <option value="">Select country</option>
                          <option value="GB">United Kingdom</option>
                          <option value="NG">Nigeria</option>
                          <option value="IN">India</option>
                          <option value="GH">Ghana</option>
                          <option value="KE">Kenya</option>
                          <option value="ZA">South Africa</option>
                          <option value="US">United States</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
                      <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+44 7700 000000" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Brief bio</label>
                      <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Tell us about your customer service experience..." className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none" />
                    </div>
                  </>
                )}

                <div className={`flex gap-3 pt-2 ${step > 1 ? "flex-row" : ""}`}>
                  {step > 1 && (
                    <button type="button" onClick={() => setStep(step - 1)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors">
                      Back
                    </button>
                  )}
                  <button type="submit" disabled={loading} className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : step === 2 ? "Submit application" : "Continue"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
