import { Link, Navigate } from "react-router-dom";
import {
  Sparkles,
  Flame,
  BarChart3,
  Brain,
  CheckCircle2,
  ArrowRight,
  Target,
  Activity,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import OrbitingHabits from "../components/OrbitingHabits.jsx";

const features = [
  {
    icon: CheckCircle2,
    title: "Track daily habits",
    desc: "One-click check-offs with progress rings, streaks and a 90-day heatmap.",
  },
  {
    icon: Brain,
    title: "AI weekly insights",
    desc: "Personalised reports on what worked, what struggled, and what to try next.",
  },
  {
    icon: Flame,
    title: "Streak recovery coach",
    desc: "When streaks break, AI generates a gentle 3-day comeback plan.",
  },
  {
    icon: BarChart3,
    title: "Beautiful statistics",
    desc: "See patterns across days, weeks, categories — with an AI chat built-in.",
  },
];

export default function Landing() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen">
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Sparkles size={18} />
          </div>
          <span className="font-semibold text-lg">AI Habit Tracker</span>
        </div>
        <nav className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="btn-ghost p-2.5"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="btn-primary">
            Get started
          </Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 pt-10 md:pt-16 pb-16">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-6 items-center">
          <div className="lg:col-span-8 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-1.5 chip mb-5 bg-brand-500/15 text-brand-700 dark:text-brand-300">
              <Sparkles size={12} />
              AI-powered habit coach
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.08]">
              Build habits that stick,
              <br />
              with an AI that actually{" "}
              <span className="bg-gradient-to-br from-brand-400 to-brand-700 bg-clip-text text-transparent">
                knows you
              </span>
              .
            </h1>
            <p className="mt-5 text-soft text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Track your habits, watch your streaks grow, and let AI turn your
              data into real encouragement — not generic motivation.
            </p>
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-3">
              <Link to="/register" className="btn-primary px-5 py-3 text-base">
                Start free
                <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn-secondary px-5 py-3 text-base">
                I have an account
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 order-1 lg:order-2 flex justify-center lg:-mr-36">
            <OrbitingHabits />
          </div>
        </div>

        <div className="mt-14 md:mt-20 grid md:grid-cols-2 gap-6">
          <div className="card p-6 relative overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300 mb-2">
              Today
            </div>
            <div className="space-y-3">
              {[
                { icon: "💧", name: "Drink 2L water", done: true, streak: 12 },
                { icon: "📚", name: "Read 20 minutes", done: true, streak: 7 },
                { icon: "🏃", name: "Morning run", done: false, streak: 3 },
              ].map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-xl glass p-3 ${h.done ? "ring-1 ring-brand-500/30" : ""
                    }`}
                >
                  <span className="w-9 h-9 rounded-lg bg-brand-500/15 flex items-center justify-center">
                    {h.icon}
                  </span>
                  <div className="flex-1 text-sm font-medium">{h.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Flame size={12} className="text-orange-500" />
                    {h.streak}
                  </div>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${h.done
                      ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-500/30"
                      : "border-2 border-[var(--surface-border)]"
                      }`}
                  >
                    {h.done && <CheckCircle2 size={14} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none opacity-60"
              style={{
                background:
                  "radial-gradient(circle at 0% 0%, rgba(99,102,241,0.22), transparent 55%)",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300 mb-2">
                <Sparkles size={12} />
                AI Weekly Report
              </div>
              <p className="text-sm leading-relaxed">
                Big week for hydration — 7/7 on <b>Drink 2L water</b>! Your
                morning runs slipped to 3/5 on weekdays. Consistency pattern:
                you're strongest Mon–Wed. Try prepping shoes by the door tonight
                to protect tomorrow's momentum. Proud of you.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Streaks", value: "4" },
                  { label: "This week", value: "86%" },
                  { label: "Best ever", value: "28d" },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-xl p-3">
                    <div className="text-lg font-semibold">{s.value}</div>
                    <div className="text-xs text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 border-t divider">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Everything you need, nothing you don't
          </h2>
          <p className="mt-3 text-soft">
            Clean tracking, deep stats, and AI features that understand your
            actual data.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card p-5">
              <div className="w-10 h-10 rounded-xl bg-brand-500/15 text-brand-600 dark:text-brand-300 flex items-center justify-center mb-3">
                <f.icon size={18} />
              </div>
              <div className="font-medium">{f.title}</div>
              <div className="text-sm text-soft mt-1 leading-relaxed">
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="relative p-10 text-center rounded-2xl overflow-hidden bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-2xl shadow-brand-500/30">
          <div
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              background:
                "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.25), transparent 55%), radial-gradient(circle at 80% 80%, rgba(236,72,153,0.3), transparent 55%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Target size={18} />
              <Activity size={18} />
              <Sparkles size={18} />
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Your first streak is 3 clicks away.
            </h2>
            <p className="mt-3 text-brand-100 max-w-lg mx-auto">
              Create your account, add a habit, check it off. That's the whole
              onboarding.
            </p>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 px-5 py-3 text-sm font-semibold hover:bg-brand-50 transition shadow-xl"
            >
              Create my account
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-center text-xs text-faint border-t divider">
        Built with MERN · AI Habit Tracker © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
