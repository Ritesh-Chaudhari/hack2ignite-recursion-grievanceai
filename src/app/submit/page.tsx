"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import {
  CategoryBadge,
  LanguageBadge,
  PriorityBadge,
} from "@/components/badges";
import { CATEGORIES, DEPARTMENTS } from "@/lib/constants";
import type {
  Category,
  SubmitGrievanceResponse,
} from "@/lib/types";

const AI_STAGES = [
  "Reading your complaint…",
  "Detecting language…",
  "Classifying category…",
  "Scoring priority…",
  "Writing officer summary…",
];

interface FormState {
  title: string;
  description: string;
  location: string;
  category: Category;
}

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  location: "",
  category: "Other",
};

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (form.title.trim().length < 5)
    errors.title = "Title should be at least 5 characters.";
  if (form.description.trim().length < 20)
    errors.description = "Describe the issue in at least 20 characters.";
  if (form.location.trim().length < 3)
    errors.location = "Where is the issue? Add a landmark or ward.";
  return errors;
}

export default function SubmitPage() {
  const { user, loading } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitGrievanceResponse | null>(null);
  const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const errors = validate(form);

  useEffect(() => {
    return () => {
      if (stageTimer.current) clearInterval(stageTimer.current);
    };
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function showFieldError(key: keyof FormState): string | undefined {
    return touched[key] ? errors[key] : undefined;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setTouched({ title: true, description: true, location: true });
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setStage(0);
    stageTimer.current = setInterval(() => {
      setStage((s) => Math.min(s + 1, AI_STAGES.length - 1));
    }, 550);

    try {
      const minDelay = new Promise((r) => setTimeout(r, 2300));
      const [res] = await Promise.all([
        fetch("/api/grievances", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }),
        minDelay,
      ]);
      const data = (await res.json()) as SubmitGrievanceResponse & { error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error ?? "Submission failed. Please try again.");
      }
      setResult(data);
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : "Submission failed. Please try again.",
      );
    } finally {
      if (stageTimer.current) clearInterval(stageTimer.current);
      setSubmitting(false);
    }
  }

  function resetAll() {
    setForm(INITIAL_FORM);
    setTouched({});
    setResult(null);
    setServerError(null);
  }

  // ---------------------------------------------------------------------------
  // Loading / logged-out states
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton mt-6 h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="card animate-pop w-full p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl">
            🔐
          </div>
          <h1 className="text-xl font-black text-ink">Log in to file a grievance</h1>
          <p className="mt-2 text-sm text-muted">
            Create a free account so you can track your complaint to resolution.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/login" className="btn btn-ghost flex-1">Log in</Link>
            <Link href="/signup" className="btn btn-primary flex-1">Sign up</Link>
          </div>
        </div>
      </div>
    );
  }

  // Only citizens can file grievances
  if (user.role === "admin") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="card animate-pop w-full p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warn-soft text-2xl">
            🛡️
          </div>
          <h1 className="text-xl font-black text-ink">Officers cannot file grievances</h1>
          <p className="mt-2 text-sm text-muted">
            As an officer, you can view and manage grievances from the dashboard.
          </p>
          <Link href="/admin" className="btn btn-primary mt-6">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Confirmation screen
  // ---------------------------------------------------------------------------

  if (result) {
    const g = result.grievance;
    const dept = DEPARTMENTS[g.category];
    return (
      <div className="mx-auto max-w-2xl px-4 py-14">
        <div className="card animate-pop overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary-dark px-8 py-10 text-center text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl backdrop-blur">
              ✓
            </div>
            <h1 className="mt-4 text-2xl font-black">Grievance received</h1>
            <p className="mt-1 text-sm text-white/80">
              Reference #{g.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          <div className="space-y-5 px-8 py-7">
            <p className="text-center text-base font-medium text-ink">
              Your complaint has been received and classified as{" "}
              <CategoryBadge category={g.category} /> with priority{" "}
              <PriorityBadge priority={g.priority} />. It has been routed to the{" "}
              <span className="font-bold text-primary-dark">{dept}</span>.
            </p>

            <div className="rounded-xl border border-teal-accent/25 bg-teal-soft/40 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-teal-accent">
                ✦ AI summary for officers
              </p>
              <p className="mt-1.5 text-sm italic leading-relaxed text-ink">
                &ldquo;{g.aiSummary}&rdquo;
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <LanguageBadge language={g.language} />
                <span className="text-xs text-muted">
                  Detected language: <strong>{g.language}</strong>
                  {!g.aiProcessed && " (heuristic — AI unavailable)"}
                </span>
              </div>
            </div>

            {result.similar.length > 0 && (
              <div className="animate-fade-up rounded-xl border border-warn/25 bg-warn-soft/50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-warn">
                  🔗 {result.similar.length} similar report
                  {result.similar.length > 1 ? "s" : ""} grouped with yours
                </p>
                <ul className="mt-2 space-y-1.5">
                  {result.similar.map((s) => (
                    <li key={s.id} className="text-sm text-ink">
                      <span className="font-semibold">{s.title}</span>
                      <span className="text-muted"> — {s.location}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-muted">
                  Clustered complaints help the department act faster on shared problems.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Link href="/my-grievances" className="btn btn-primary flex-1">
                Track my grievance
              </Link>
              <button onClick={resetAll} className="btn btn-ghost flex-1">
                Submit another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Submission form
  // ---------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="animate-fade-up">
        <h1 className="text-3xl font-black tracking-tight text-ink">
          File a grievance
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Tell us what&rsquo;s wrong. Write in any language — AI will understand and route it to the right department.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card animate-fade-up mt-6 space-y-5 p-6 sm:p-8" noValidate>
        {/* Language info - no selector needed */}
        <div className="rounded-xl border border-teal-accent/25 bg-teal-soft/40 p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">🌐</span>
            <div>
              <p className="text-sm font-semibold text-ink">Write in any language</p>
              <p className="mt-1 text-xs text-muted">
                Hindi, Marathi, English, or any other language — our AI will automatically detect and understand your complaint.
              </p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="label">Title</label>
          <input
            id="title"
            type="text"
            className={`field ${showFieldError("title") ? "field-error" : ""}`}
            placeholder="e.g. No water supply since Monday"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, title: true }))}
            aria-required="true"
            aria-invalid={!!showFieldError("title")}
          />
          {showFieldError("title") && (
            <p className="mt-1.5 text-xs font-medium text-danger">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="label">
            Description
            <span className="ml-2 text-xs font-normal text-muted">
              {form.description.trim().length}/20 min — write freely in any language
            </span>
          </label>
          <textarea
            id="description"
            rows={5}
            className={`field resize-y ${showFieldError("description") ? "field-error" : ""}`}
            placeholder="Describe the problem, since when, and who is affected… (you can write in Hindi, Marathi, or any language)"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, description: true }))}
            aria-required="true"
            aria-invalid={!!showFieldError("description")}
          />
          {showFieldError("description") && (
            <p className="mt-1.5 text-xs font-medium text-danger">{errors.description}</p>
          )}
        </div>

        {/* Location + Category */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="location" className="label">Location</label>
            <input
              id="location"
              type="text"
              className={`field ${showFieldError("location") ? "field-error" : ""}`}
              placeholder="e.g. Gandhi Chowk, Ward 7"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, location: true }))}
              aria-required="true"
              aria-invalid={!!showFieldError("location")}
            />
            {showFieldError("location") && (
              <p className="mt-1.5 text-xs font-medium text-danger">{errors.location}</p>
            )}
          </div>
          <div>
            <label htmlFor="category" className="label">
              Category <span className="text-xs font-normal text-muted">(AI may correct this)</span>
            </label>
            <select
              id="category"
              className="field"
              value={form.category}
              onChange={(e) => update("category", e.target.value as Category)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {serverError && (
          <p className="animate-pop rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
            {serverError}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3 text-base">
          {submitting ? "Analyzing…" : "Submit with AI analysis →"}
        </button>
      </form>

      {/* AI processing overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/70 backdrop-blur-sm animate-fade-in">
          <div className="mx-4 w-full max-w-sm animate-pop rounded-2xl bg-white p-7 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-xl">
                🧠
                <span className="absolute inset-0 animate-pulse-ring rounded-2xl" />
              </span>
              <div>
                <p className="text-sm font-black text-ink">Gemini is triaging your grievance</p>
                <p className="text-xs text-muted">Usually takes a few seconds</p>
              </div>
            </div>

            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-teal-accent transition-all duration-450"
                style={{ width: `${((stage + 1) / AI_STAGES.length) * 100}%` }}
              />
            </div>

            <ul className="mt-4 space-y-2">
              {AI_STAGES.map((s, i) => (
                <li
                  key={s}
                  className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                    i < stage ? "text-ok" : i === stage ? "text-ink" : "text-muted/70"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                      i < stage
                        ? "bg-ok text-white"
                        : i === stage
                          ? "bg-primary text-white"
                          : "border border-line bg-canvas text-muted"
                    }`}
                  >
                    {i < stage ? "✓" : i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
