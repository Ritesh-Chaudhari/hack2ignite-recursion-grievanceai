"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CategoryBadge,
  LanguageBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/badges";
import { StatusTimeline } from "@/components/status-timeline";
import { CATEGORIES, DEPARTMENTS, PRIORITIES, STATUSES } from "@/lib/constants";
import type { Category, Grievance, Priority, Status } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GrievanceDrawer({
  grievance,
  allGrievances,
  onClose,
  onUpdated,
}: {
  grievance: Grievance | null;
  allGrievances: Grievance[];
  onClose: () => void;
  onUpdated: (updated: Grievance) => void;
}) {
  const [status, setStatus] = useState<Status>("Pending");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [category, setCategory] = useState<Category>("Other");
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (grievance) {
      setStatus(grievance.status);
      setPriority(grievance.priority);
      setCategory(grievance.category);
      setError(null);
      setSavedFlash(false);
    }
  }, [grievance]);

  async function save() {
    if (!grievance) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/grievances/${grievance.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority, category }),
      });
      const data = (await res.json()) as { grievance?: Grievance; error?: string };
      if (!res.ok || !data.grievance) {
        throw new Error(data.error ?? "Update failed.");
      }
      onUpdated(data.grievance);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  const duplicates = (grievance?.duplicateOf ?? [])
    .map((id) => allGrievances.find((g) => g.id === id))
    .filter((g): g is Grievance => Boolean(g));

  return (
    <AnimatePresence>
      {grievance && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-navy/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Ref #{grievance.id.slice(0, 8).toUpperCase()}
                </p>
                <h2 className="mt-0.5 text-lg font-black leading-snug text-ink">
                  {grievance.title}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(grievance.createdAt)} · by {grievance.submitterName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition hover:bg-canvas hover:text-ink"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="flex flex-wrap gap-1.5">
                <CategoryBadge category={grievance.category} />
                <PriorityBadge priority={grievance.priority} />
                <StatusBadge status={grievance.status} />
                <LanguageBadge language={grievance.language} />
              </div>

              <div className="rounded-xl border border-teal-accent/25 bg-teal-soft/40 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-accent">
                  ✦ AI summary {grievance.aiProcessed ? "" : "(heuristic fallback)"}
                </p>
                <p className="mt-1.5 text-sm italic leading-relaxed text-ink">
                  &ldquo;{grievance.aiSummary || "—"}&rdquo;
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted">
                  Complaint
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                  {grievance.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-canvas p-3">
                  <p className="text-xs text-muted">Location</p>
                  <p className="font-semibold text-ink">📍 {grievance.location}</p>
                </div>
                <div className="rounded-xl bg-canvas p-3">
                  <p className="text-xs text-muted">Routed to</p>
                  <p className="font-semibold text-ink">{DEPARTMENTS[grievance.category]}</p>
                </div>
              </div>

              {duplicates.length > 0 && (
                <div className="rounded-xl border border-warn/25 bg-warn-soft/50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-warn">
                    🔗 Grouped with {duplicates.length} similar report{duplicates.length > 1 ? "s" : ""}
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {duplicates.map((d) => (
                      <li key={d.id} className="text-sm text-ink">
                        <span className="font-semibold">{d.title}</span>
                        <span className="text-muted"> — {d.location} · {d.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-xl border border-line p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">
                  Progress
                </h3>
                <StatusTimeline status={status} />
              </div>

              {/* Admin controls */}
              <div className="rounded-xl border border-primary/20 bg-primary-soft/50 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-primary-dark">
                  Officer actions
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink">Status</span>
                    <select
                      className="field !py-2 text-sm"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Status)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink">Priority</span>
                    <select
                      className="field !py-2 text-sm"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-ink">Category</span>
                    <select
                      className="field !py-2 text-sm"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {error && (
                  <p className="mt-2 text-xs font-medium text-danger">{error}</p>
                )}
                <button
                  onClick={() => void save()}
                  disabled={saving}
                  className="btn btn-primary mt-3 w-full sm:w-auto"
                >
                  {saving ? "Saving…" : savedFlash ? "✓ Saved" : "Save changes"}
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
