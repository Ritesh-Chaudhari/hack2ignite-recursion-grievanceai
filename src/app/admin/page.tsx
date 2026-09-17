"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import {
  CategoryBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/badges";
import { checkSlaBreach, formatSlaStatus, SLA_HOURS } from "@/lib/sla";
import { grievancesToCsv, downloadCsv } from "@/lib/export-csv";
import {
  CATEGORIES,
  DEPARTMENTS,
  PRIORITIES,
  PRIORITY_WEIGHT,
  STATUSES,
} from "@/lib/constants";
import type { Grievance } from "@/lib/types";

// Lazy-load heavy components to keep the initial bundle small.
const Analytics = lazy(() => import("@/components/admin/analytics").then((m) => ({ default: m.Analytics })));
const GrievanceDrawer = lazy(() => import("@/components/admin/grievance-drawer").then((m) => ({ default: m.GrievanceDrawer })));

type SortMode = "priority" | "newest";

interface Filters {
  status: string;
  category: string;
  priority: string;
  search: string;
}

const EMPTY_FILTERS: Filters = { status: "all", category: "all", priority: "all", search: "" };

const PAGE_SIZE = 20;

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [seedState, setSeedState] = useState<"idle" | "seeding" | "done" | "skipped">("idle");
  const [page, setPage] = useState(0);

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
    if (user?.role === "admin") {
      // Auto-seed on first boot if no data exists, then load.
      void (async () => {
        await fetch("/api/seed", { method: "GET" }); // Auto-seed (idempotent)
        await load();
      })();
    } else if (!authLoading) {
      setLoading(false);
    }
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

  // Reset to first page when filters change
  const paginatedGrievances = useMemo(() => {
    setPage(0);
    return filtered;
  }, [filtered]);

  const totalPages = Math.ceil(paginatedGrievances.length / PAGE_SIZE);
  const visibleGrievances = paginatedGrievances.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const stats = useMemo(() => {
    const total = grievances.length;
    const urgent = grievances.filter((g) => g.priority === "Urgent").length;
    const open = grievances.filter((g) => g.status !== "Resolved").length;
    const resolved = grievances.filter((g) => g.status === "Resolved").length;
    const resolutionRate = total === 0 ? 0 : Math.round((resolved / total) * 100);
    const slaBreaches = grievances.filter(
      (g) => checkSlaBreach(g.createdAt, g.priority, g.status) !== null,
    ).length;
    return { total, urgent, open, resolved, resolutionRate, slaBreaches };
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
          <button
            onClick={() => {
              const csv = grievancesToCsv(paginatedGrievances);
              const ts = new Date().toISOString().slice(0, 10);
              downloadCsv(csv, `grievances-${ts}.csv`);
            }}
            className="btn btn-ghost"
            disabled={paginatedGrievances.length === 0}
          >
            ⬇ Export CSV
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

      {/* KPI cards — CSS animations instead of framer-motion */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {(
          [
            { label: "Total grievances", value: stats.total, accent: "text-ink" },
            { label: "Urgent", value: stats.urgent, accent: "text-danger" },
            { label: "Open cases", value: stats.open, accent: "text-info" },
            { label: "SLA breaches", value: stats.slaBreaches, accent: stats.slaBreaches > 0 ? "text-danger" : "text-ok" },
            {
              label: "Resolution rate",
              value: `${stats.resolutionRate}%`,
              accent: "text-ok",
            },
          ] as const
        ).map((kpi, i) => (
          <div
            key={kpi.label}
            className="card card-hover animate-fade-up p-5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {kpi.label}
            </p>
            <p className={`mt-1 text-3xl font-black ${kpi.accent}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Analytics (lazy-loaded: recharts is ~500KB) */}
      <div className="mt-8">
        <Suspense fallback={<div className="skeleton h-72 w-full" />}>
          <Analytics grievances={grievances} filterCategory={filters.category} />
        </Suspense>
      </div>

      {/* Filters */}
      <div className="card animate-fade-up mt-8 flex flex-wrap items-end gap-3 p-4">
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
      </div>

      {/* Grievance list */}
      <div className="mt-5">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 w-full" />
            ))}
          </div>
        ) : paginatedGrievances.length === 0 ? (
          <div className="card animate-pop p-12 text-center">
            <p className="text-2xl">🗂️</p>
            <p className="mt-2 font-bold text-ink">No grievances match these filters</p>
            <p className="mt-1 text-sm text-muted">
              Adjust the filters or load demo data to explore the dashboard.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {visibleGrievances.map((g, i) => (
                <button
                  key={g.id}
                  className="card card-hover animate-fade-up block w-full cursor-pointer p-5 text-left"
                  style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                  onClick={() => setSelected(g)}
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
                      {(() => {
                        const sla = formatSlaStatus(g.createdAt, g.priority, g.status);
                        return (
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                              sla.breached
                                ? "border-danger/25 bg-danger-soft text-danger"
                                : "border-line bg-canvas text-muted"
                            }`}
                            title={`SLA: ${SLA_HOURS[g.priority]}h deadline for ${g.priority} priority`}
                          >
                            ⏱ {sla.text}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] font-medium text-primary">
                    {DEPARTMENTS[g.category]} →
                  </p>
                </button>
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn btn-ghost !px-3 !py-1.5 text-xs"
                >
                  ← Prev
                </button>
                <span className="text-sm text-muted">
                  Page {page + 1} of {totalPages}
                  <span className="ml-2 text-xs">({paginatedGrievances.length} results)</span>
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn btn-ghost !px-3 !py-1.5 text-xs"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Suspense fallback={null}>
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
      </Suspense>
    </div>
  );
}
