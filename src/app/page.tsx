import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";

const FEATURES = [
  {
    icon: "🌐",
    title: "Write in any language",
    body: "File complaints in Hindi, Marathi, English, or any other language. AI understands them all automatically.",
  },
  {
    icon: "🧠",
    title: "AI classification & priority",
    body: "Gemini reads every grievance, assigns the right category and an urgency level from Low to Urgent the moment it arrives.",
  },
  {
    icon: "📍",
    title: "Duplicate detection",
    body: "Similar complaints from the same area are grouped automatically so officers see patterns, not noise.",
  },
  {
    icon: "📊",
    title: "Live analytics",
    body: "Department dashboards show category breakdowns, priority heat and weekly trends at a glance.",
  },
  {
    icon: "🔔",
    title: "Transparent tracking",
    body: "Citizens follow every status change — Pending → In Progress → Resolved — with a clear timeline.",
  },
  {
    icon: "⚡",
    title: "Instant acknowledgment",
    body: "Every submission is acknowledged on the spot with its classification, priority and routed department.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Submit in your language",
    body: "Describe the issue with a location. Any language works — AI handles translation.",
  },
  {
    step: "2",
    title: "AI triages instantly",
    body: "Gemini classifies the grievance, scores its priority, and writes a crisp English summary for officers.",
  },
  {
    step: "3",
    title: "Track to resolution",
    body: "The concerned department picks it up; you watch the status move in real time.",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-soft to-primary/90 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-teal-accent/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-20 text-center sm:px-6">
          <span className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-accent" />
            Hack 2 Ignite · Problem AI-04 · Team Recursion
          </span>
          <h1 className="animate-fade-up mt-6 text-balance text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
            Your city&rsquo;s voice,{" "}
            <span className="bg-gradient-to-r from-teal-accent to-white bg-clip-text text-transparent">
              heard by AI
            </span>
          </h1>
          <p className="animate-fade-up mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/80">
            GrievanceAI registers public complaints in any language,
            classifies and prioritizes them with Gemini, routes them to the right
            department, and tracks every step to resolution.
          </p>
          <div className="animate-fade-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/submit" className="btn btn-primary px-8 py-3 text-base">
              Submit a grievance →
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              🌐 Any language supported
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              🧠 Powered by Gemini AI
            </span>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              ⚡ Instant processing
            </span>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="card card-hover animate-fade-up p-6"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-xl">
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-black tracking-tight text-ink">
            From complaint to resolution in three steps
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-xl font-black text-white shadow-lg shadow-primary/30">
                  {s.step}
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
                  {s.body}
                </p>
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute right-[-14%] top-7 hidden h-px w-[28%] bg-gradient-to-r from-primary/40 to-transparent md:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <h2 className="text-2xl font-black tracking-tight text-ink">
          Covering the issues that matter
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((c) => (
            <span
              key={c}
              className="card card-hover cursor-default px-5 py-2.5 text-sm font-semibold text-ink"
            >
              {c}
            </span>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="btn btn-primary px-8 py-3 text-base inline-flex"
          >
            Create your account
          </Link>
          <Link
            href="/login"
            className="btn btn-ghost px-8 py-3 text-base inline-flex"
          >
            Already registered? Log in
          </Link>
        </div>
      </section>

      {/* Role info section */}
      <section className="border-y border-line bg-canvas py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-black tracking-tight text-ink">
            How it works for everyone
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Citizen card */}
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-2xl">
                  👤
                </span>
                <div>
                  <h3 className="text-lg font-bold text-ink">For Citizens</h3>
                  <p className="text-sm text-muted">Report & track issues</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  File grievances in any language
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  Track status in real-time
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  See AI-generated summaries
                </li>
              </ul>
            </div>
            {/* Officer card */}
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-soft text-2xl">
                  🛡️
                </span>
                <div>
                  <h3 className="text-lg font-bold text-ink">For Officers</h3>
                  <p className="text-sm text-muted">Investigate & resolve</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  AI-prioritized grievance queue
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  Analytics & trend dashboards
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  Update status & track SLAs
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
