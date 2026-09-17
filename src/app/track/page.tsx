"use client";

import { useState } from "react";
import { CategoryBadge, PriorityBadge, StatusBadge } from "@/components/badges";
import { StatusTimeline } from "@/components/status-timeline";
import { DEPARTMENTS } from "@/lib/constants";
import type { Grievance } from "@/lib/types";

export default function TrackPage() {
  const [id, setId] = useState("");
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGrievance(null);
    const trimmed = id.trim();
    if (!trimmed) {
      setError("Please enter a grievance ID.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/grievances/${trimmed}`);
      if (res.status === 404) {
        setError("No grievance found with that ID. Please check and try again.");
        return;
      }
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Could not look up grievance.");
        return;
      }
      const data = (await res.json()) as { grievance: Grievance };
      setGrievance(data.grievance);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="animate-fade-up text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl">
          🔍
        </div>
        <h1 className="text-3xl font-black tracking-tight text-ink">
          Track your grievance
        </h1>
        <p className="mt-2 text-sm text-muted">
          Enter your grievance reference ID to see the current status.
          No login required.
        </p>
      </div>

      <form onSubmit={handleSearch} className="card animate-fade-up mt-8 p-6">
        <label htmlFor="grievance-id" className="label">
          Grievance ID
        </label>
        <div className="flex gap-2">
          <input
            id="grievance-id"
            type="text"
            className="field flex-1"
            placeholder="e.g. seed-1 or a UUID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Searching…" : "Look up"}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm font-medium text-danger">{error}</p>
        )}
      </form>

      {grievance && (
        <div className="card animate-fade-up mt-6 overflow-hidden">
          <div className="border-b border-line px-6 py-4 bg-gradient-to-r from-primary/5 to-teal-accent/5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Ref #{grievance.id.slice(0, 8).toUpperCase()}
            </p>
            <h2 className="mt-1 text-lg font-black text-ink">
              {grievance.title}
            </h2>
            <p className="mt-1 text-xs text-muted">
              {new Date(grievance.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="space-y-5 px-6 py-5">
            <div className="flex flex-wrap gap-1.5">
              <CategoryBadge category={grievance.category} />
              <PriorityBadge priority={grievance.priority} />
              <StatusBadge status={grievance.status} />
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted">
                Status timeline
              </h3>
              <div className="mt-3">
                <StatusTimeline status={grievance.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-canvas p-3">
                <p className="text-xs text-muted">Location</p>
                <p className="font-semibold text-ink">📍 {grievance.location}</p>
              </div>
              <div className="rounded-xl bg-canvas p-3">
                <p className="text-xs text-muted">Routed to</p>
                <p className="font-semibold text-ink">
                  {DEPARTMENTS[grievance.category]}
                </p>
              </div>
            </div>

            {grievance.aiSummary && (
              <div className="rounded-xl border border-teal-accent/25 bg-teal-soft/40 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-teal-accent">
                  ✦ Summary
                </p>
                <p className="mt-1.5 text-sm italic leading-relaxed text-ink">
                  &ldquo;{grievance.aiSummary}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
