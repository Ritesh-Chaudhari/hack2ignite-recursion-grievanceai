"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth-provider";
import {
  CategoryBadge,
  LanguageBadge,
  PriorityBadge,
  StatusBadge,
} from "@/components/badges";
import { StatusTimeline } from "@/components/status-timeline";
import { DEPARTMENTS } from "@/lib/constants";
import type { Grievance } from "@/lib/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyGrievancesPage() {
  const { user, loading: authLoading } = useAuth();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    void (async () => {
      try {
        const res = await fetch("/api/grievances", { cache: "no-store" });
        const data = (await res.json()) as { grievances?: Grievance[] };
        setGrievances(data.grievances ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (authLoading || (user && loading)) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-12">
        <div className="skeleton h-9 w-72" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-44 w-full" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="card animate-pop w-full p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl">
            📋
          </div>
          <h1 className="text-xl font-black text-ink">Track your grievances</h1>
          <p className="mt-2 text-sm text-muted">
            Log in to see the status of every complaint you have filed.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/login" className="btn btn-ghost flex-1">Log in</Link>
            <Link href="/signup" className="btn btn-primary flex-1">Sign up</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="animate-fade-up flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink">
            My grievances
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {grievances.length} complaint{grievances.length === 1 ? "" : "s"} filed
            {grievances.length > 0 &&
              ` · ${grievances.filter((g) => g.status === "Resolved").length} resolved`}
          </p>
        </div>
        <Link href="/submit" className="btn btn-primary">+ New grievance</Link>
      </div>

      {grievances.length === 0 ? (
        <div className="card animate-pop mt-8 p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl">
            🕊️
          </div>
          <h2 className="text-lg font-bold text-ink">Nothing here yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
            When you report a civic issue it will appear here with live status
            tracking from Pending to Resolved.
          </p>
          <Link href="/submit" className="btn btn-primary mt-6">
            File your first grievance
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {grievances.map((g, i) => (
            <motion.article
              key={g.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.4), duration: 0.4 }}
              className="card card-hover p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-ink">{g.title}</h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDate(g.createdAt)} · 📍 {g.location}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <CategoryBadge category={g.category} />
                  <PriorityBadge priority={g.priority} />
                  <StatusBadge status={g.status} />
                  <LanguageBadge language={g.language} />
                </div>
              </div>

              {g.aiSummary && (
                <p className="mt-4 rounded-lg border border-teal-accent/20 bg-teal-soft/40 px-3.5 py-2.5 text-sm italic leading-relaxed text-ink">
                  ✦ &ldquo;{g.aiSummary}&rdquo;
                </p>
              )}

              <p className="mt-3 text-xs text-muted">
                Routed to <span className="font-semibold text-ink">{DEPARTMENTS[g.category]}</span>
                {g.duplicateOf && g.duplicateOf.length > 0 && (
                  <> · 🔗 grouped with {g.duplicateOf.length} similar report{g.duplicateOf.length > 1 ? "s" : ""}</>
                )}
              </p>

              <div className="mt-5 border-t border-line pt-5">
                <StatusTimeline status={g.status} />
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
