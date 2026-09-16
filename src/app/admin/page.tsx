"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import {
  CategoryBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/badges";
import { Analytics } from "@/components/admin/analytics";
import { GrievanceDrawer } from "@/components/admin/grievance-drawer";
import {
  CATEGORIES,
  DEPARTMENTS,
  PRIORITIES,
  PRIORITY_WEIGHT,
  STATUSES,
} from "@/lib/constants";
import type { Grievance } from "@/lib/types";

type SortMode = "priority" | "newest";

interface Filters {
  status: string;
  category: string;
  priority: string;
  search: string;
}

const EMPTY_FILTERS: Filters = { status: "all", category: "all", priority: "all", search: "" };

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [seedState, setSeedState] = useState<"idle" | "seeding" | "done" | "skipped">("idle");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/grievances", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { grievances?: Grievance[] };
      setGrievances(data.grievances ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") void load();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading, load]);

  async function seed() {
    setSeedState("seeding");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = (await res.json()) as { seeded?: boolean; message?: string };
      setSeedState(data.seeded ? "done" : "skipped");
      await load();
      setTimeout(() => setSeedState("idle"), 2600);
    } catch {
      setSeedState("idle");
    }
  }

  const filtered = useMemo(() => {
    let list = grievances;
    if (filters.status !== "all") {
      list = list.filter((g) => g.status === filters.status);
    }
    if (filters.category !== "all") {
      list = list.filter((g) => g.category === filters.category);
    }
    if (filters.priority !== "all") {
      list = list.filter((g) => g.priority === filters.priority);
    }
    const q = filters.search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.location.toLowerCase().includes(q) ||
          g.aiSummary.toLowerCase().includes(q) ||
          g.submitterName.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) =>
      sortMode === "priority"
        ? PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] ||
          b.createdAt.localeCompare(a.createdAt)
        : b.createdAt.localeCompare(a.createdAt),
    );
  }, [grievances, filters, sortMode]);

  const stats = useMemo(() => {
    const total = grievances.length;
    const urgent = grievances.filter((g) => g.priority === "Urgent").length;
    const open = grievances.filter((g) => g.status !== "Resolved").length;
    const resolved = grievances.filter((g) => g.status === "Resolved").length;
    const resolutionRate = total === 0 ? 0 : Math.round((resolved / total) * 100);
    return { total, urgent, open, resolved, resolutionRate };
  }, [grievances]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-12">
        <div className="skeleton h-10 w-80" />
        <div className="skeleton h-28 w-full" />
        <div className="skeleton h-96 w-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="card animate-pop w-full p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-warn-soft text-2xl">
            🛡️
          </div>
          <h1 className="text-xl font-black text-ink">Officers only</h1>
          <p className="mt-2 text-sm text-muted">
            The admin dashboard requires an officer account. Use the demo officer
            login from the login page.
          </p>
          <Link href="/login" className="btn btn-primary mt-6">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink">
            Officer dashboard
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Welcome, {user.name} · AI-triaged grievances, Urgent first
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="btn btn-ghost">
            ↻ Refresh
          </button>
          <button onClick={() => void seed()} className="btn btn-ghost" disabled={seedState === "seeding"}>
            {seedState === "seeding"
              ? "Seeding…"
              : seedState === "done"
                ? "✓ Demo data added"
                : seedState === "skipped"
                  ? "Data exists"
                  : "Load demo data"}
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="animate-fade-up mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(
          [
            { label: "Total grievances", value: stats.total, accent: "text-ink" },
            { label: "Urgent", value: stats.urgent, accent: "text-danger" },
            { label: "Open cases", value: stats.open, accent: "text-info" },
            {
              label: "Resolution rate",
              value: `${stats.resolutionRate}%`,
              accent: "text-ok",
            },
          ] as const
        ).map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card card-hover p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {kpi.label}
            </p>
            <p className={`mt-1 text-3xl font-black ${kpi.accent}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Analytics */}
      <div className="mt-8">
        <Analytics grievances={grievances} />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mt-8 flex flex-wrap items-end gap-3 p-4"
      >
        <div className="min-w-[200px] flex-1">
          <label htmlFor="search" className="mb-1 block text-xs font-semibold text-muted">
            Search title, location, summary
          </label>
          <input
            id="search"
            className="field !py-2"
            placeholder="e.g. water, Ward 7…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          />
        </div>
        {(
          [
            { key: "status", options: STATUSES, label: "Status" },
            { key: "category", options: CATEGORIES, label: "Category" },
            { key: "priority", options: PRIORITIES, label: "Priority" },
          ] as const
        ).map(({ key, options, label }) => (
          <div key={key} className="w-36">
            <label htmlFor={`f-${key}`} className="mb-1 block text-xs font-semibold text-muted">
              {label}
            </label>
            <select
              id={`f-${key}`}
              className="field !py-2"
              value={filters[key]}
              onChange={(e) =>
                setFilters((f) => ({ ...f, [key]: e.target.value }))
              }
            >
              <option value="all">All</option>
              {options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        ))}
        <div className="w-36">
          <label htmlFor="sort" className="mb-1 block text-xs font-semibold text-muted">
            Sort by
          </label>
          <select
            id="sort"
            className="field !py-2"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            <option value="priority">Priority (Urgent first)</option>
            <option value="newest">Newest first</option>
          </select>
        </div>
        {(filters.status !== "all" ||
          filters.category !== "all" ||
          filters.priority !== "all" ||
          filters.search) && (
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="btn btn-ghost !py-2 text-xs"
          >
            Clear filters
          </button>
        )}
      </motion.div>

      {/* Grievance list */}
      <div className="mt-5">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card animate-pop p-12 text-center">
            <p className="text-2xl">🗂️</p>
            <p className="mt-2 font-bold text-ink">No grievances match these filters</p>
            <p className="mt-1 text-sm text-muted">
              Adjust the filters or load demo data to explore the dashboard.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((g, i) => (
              <motion.button
                key={g.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                onClick={() => setSelected(g)}
                className="card card-hover block w-full cursor-pointer p-5 text-left"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-base font-bold text-ink">{g.title}</h2>
                      {g.duplicateOf && g.duplicateOf.length > 0 && (
                        <span
                          className="shrink-0 rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-bold text-warn"
                          title={`Grouped with ${g.duplicateOf.length} similar report(s)`}
                        >
                          🔗 {g.duplicateOf.length}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                      ✦ {g.aiSummary}
                    </p>
                    <p className="mt-1.5 text-xs text-muted">
                      📍 {g.location} · {g.submitterName} ·{" "}
                      {new Date(g.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <CategoryBadge category={g.category} />
                    <PriorityBadge priority={g.priority} />
                    <StatusBadge status={g.status} />
                  </div>
                </div>
                <p className="mt-2 text-[11px] font-medium text-primary">
                  {DEPARTMENTS[g.category]} →
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <GrievanceDrawer
        grievance={selected}
        allGrievances={grievances}
        onClose={() => setSelected(null)}
        onUpdated={(updated) => {
          setGrievances((list) =>
            list.map((g) => (g.id === updated.id ? updated : g)),
          );
          setSelected(updated);
        }}
      />
    </div>
  );
}
