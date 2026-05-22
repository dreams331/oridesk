import Link from "next/link";
import {
  MessageSquare,
  Phone,
  Shield,
  Zap,
  BarChart3,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg">OriDesk</span>
                <span className="hidden sm:inline text-xs text-slate-400 ml-2">by Ori Global Ltd</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-slate-600 hover:text-slate-900 text-sm">Features</Link>
              <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 text-sm">How it works</Link>
              <Link href="#pricing" className="text-slate-600 hover:text-slate-900 text-sm">Pricing</Link>
              <Link href="/demo" className="text-slate-600 hover:text-slate-900 text-sm">Live Demo</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium">
                Sign in
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Get started free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
              <Zap className="w-4 h-4" />
              AI-Powered Customer Service Platform
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Smarter Support.{" "}
              <span className="text-blue-600">Safer Agents.</span>{" "}
              Happier Customers.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed mb-10 max-w-2xl mx-auto">
              OriDesk gives your business AI-assisted customer service with professional
              agents — without ever exposing your sensitive customer data. 
              Built for UK businesses. Ready for the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
              >
                Start for free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
              >
                See live demo
              </Link>
            </div>
            <p className="text-sm text-slate-400 mt-4">No credit card required · Free forever for small teams</p>
          </div>

          {/* Dashboard preview */}
          <div className="mt-20 relative">
            <div className="bg-slate-900 rounded-2xl p-1 shadow-2xl max-w-5xl mx-auto">
              <div className="bg-slate-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-slate-400 text-sm ml-2">OriDesk Agent Portal</span>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Open Tickets", value: "24", color: "bg-blue-500" },
                    { label: "Resolved Today", value: "18", color: "bg-green-500" },
                    { label: "Avg Response", value: "2m 14s", color: "bg-purple-500" },
                    { label: "CareScore", value: "94/100", color: "bg-orange-500" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-700 rounded-lg p-3">
                      <div className={`w-2 h-2 rounded-full ${stat.color} mb-2`} />
                      <p className="text-white font-bold text-lg">{stat.value}</p>
                      <p className="text-slate-400 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      J D.
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-300 text-sm font-medium">John D.</span>
                        <span className="text-slate-500 text-xs">j***@gmail.com</span>
                        <span className="bg-red-900 text-red-300 text-xs px-2 py-0.5 rounded-full">angry</span>
                        <span className="bg-orange-900 text-orange-300 text-xs px-2 py-0.5 rounded-full">URGENT</span>
                      </div>
                      <p className="text-slate-400 text-sm">&ldquo;I&apos;ve been waiting 3 days for my refund and nobody is helping me!&rdquo;</p>
                      <div className="mt-3 bg-blue-900/50 border border-blue-700 rounded-lg p-3">
                        <p className="text-blue-300 text-xs font-medium mb-1">🤖 AI Suggestion:</p>
                        <p className="text-slate-300 text-sm">&ldquo;I sincerely apologise for the delay with your refund. I can see your case and I&apos;m escalating this right now &mdash; you&apos;ll receive confirmation within 2 hours.&rdquo;</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-500 shadow-sm">
              🔒 SafeAgent™ — customer data is masked for agent protection
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof ───────────────────────────────────────────────── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm mb-8">Trusted by businesses across the UK and beyond</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-50">
            {["E-commerce", "Fintech", "Telecom", "Healthcare", "Retail"].map((industry) => (
              <span key={industry} className="text-slate-600 font-semibold text-lg">{industry}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need. Nothing you don&apos;t.</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
              A complete customer service platform built for modern businesses — powered by AI, secured by design.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "SafeAgent™ Data Masking",
                description: "Agents see masked customer data (John D., j***@gmail.com). Your customers' sensitive info never leaves your secure environment.",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Zap,
                title: "AI Reply Co-Pilot",
                description: "AI suggests perfect replies based on your knowledge base and brand tone. Agents approve and send — quality guaranteed.",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: BarChart3,
                title: "CareScore™ Rating",
                description: "Every conversation is automatically scored for empathy, resolution, and speed. Know your service quality at a glance.",
                color: "bg-orange-100 text-orange-600",
              },
              {
                icon: MessageSquare,
                title: "Live Chat Widget",
                description: "One line of code embeds a branded live chat on any website. Your clients are live in minutes.",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: Phone,
                title: "Multi-Channel Support",
                description: "Live chat, WhatsApp, email and phone — all in one inbox. Agents handle every channel from one clean dashboard.",
                color: "bg-red-100 text-red-600",
              },
              {
                icon: Globe,
                title: "Global Agent Network",
                description: "Tap into professional agents across the UK, Nigeria, India and more — while you stay in full control of quality.",
                color: "bg-teal-100 text-teal-600",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ───────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Up and running in minutes</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              No technical knowledge needed. Your team is live before lunch.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Sign up", description: "Create your account, add your company details and brand." },
              { step: "02", title: "Add knowledge", description: "Upload your FAQs, policies and brand tone. AI learns your business." },
              { step: "03", title: "Embed widget", description: "Copy one line of code to your website. Live chat is instantly active." },
              { step: "04", title: "Go live", description: "Agents handle tickets with AI assistance. You watch it all in real-time." },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-slate-700 z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, honest pricing</h2>
            <p className="text-xl text-slate-500">Enterprise customer service at startup prices.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "£49",
                period: "/month",
                description: "Perfect for small businesses",
                features: ["2 agents", "Live chat channel", "AI reply suggestions", "500 tickets/month", "Client dashboard", "Email support"],
                cta: "Get started",
                highlight: false,
              },
              {
                name: "Growth",
                price: "£149",
                period: "/month",
                description: "For growing businesses",
                features: ["10 agents", "Live chat + WhatsApp", "AI co-pilot + CareScore", "Unlimited tickets", "Advanced analytics", "Priority support"],
                cta: "Get started",
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "Full outsourced service",
                features: ["Unlimited agents", "All channels", "Dedicated account manager", "White-label option", "SLA guarantee", "24/7 support"],
                cta: "Contact us",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlight
                    ? "bg-blue-600 text-white shadow-2xl scale-105"
                    : "bg-white border border-slate-200"
                }`}
              >
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? "text-blue-100" : "text-slate-500"}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? "text-blue-100" : "text-slate-500"}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-blue-200" : "text-blue-600"}`} />
                      <span className={`text-sm ${plan.highlight ? "text-blue-50" : "text-slate-600"}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center font-semibold py-3 px-6 rounded-xl transition-colors ${
                    plan.highlight
                      ? "bg-white text-blue-600 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-blue-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your customer service?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join businesses already using OriDesk to deliver smarter, faster, safer support.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-10 py-4 rounded-xl text-lg hover:bg-blue-50 transition-colors"
          >
            Start for free today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-lg">OriDesk</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                AI-powered customer service platform. Smarter support for modern businesses worldwide.
              </p>
              <p className="text-slate-500 text-sm mt-4">
                A product of{" "}
                <a href="https://origloballtd.com" className="text-blue-400 hover:text-blue-300" target="_blank" rel="noopener noreferrer">
                  Ori Global Ltd
                </a>
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Live Demo</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Get started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="https://origloballtd.com" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Ori Global Ltd</a></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign in</Link></li>
                <li><Link href="/agent-register" className="hover:text-white transition-colors">Become an agent</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© {new Date().getFullYear()} Ori Global Ltd. All rights reserved. Registered in England & Wales.</p>
            <div className="flex items-center gap-2 text-sm">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>Powered by OriDesk</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
