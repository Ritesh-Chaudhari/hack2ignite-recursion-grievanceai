"use client";

import { useAuth } from "@/components/auth-provider";
import { DEPARTMENTS, TIMEFRAME_BY_PRIORITY } from "@/lib/constants";
import type { Category, Priority, ResolutionTimeframe } from "@/lib/types";

/**
 * Renders the AI-recommended resolution at the detail level appropriate to the
 * current viewer.
 *
 * Both variants are derived from the single `recommendedResolution` /
 * `resolutionTimeframe` pair stored on the grievance — the payload is fetched
 * once, so officers see the actionable steps and citizens see a public-friendly
 * one-liner without any extra request.
 *
 * Officers get the full prose; everyone else (citizens, logged-out visitors on
 * the public tracking page) gets the routing + expected timeline only.
 */
export function ResolutionNote({
  category,
  priority,
  recommendedResolution,
  resolutionTimeframe,
  aiProcessed,
  className = "",
}: {
  category: Category;
  priority: Priority;
  recommendedResolution: string;
  resolutionTimeframe?: ResolutionTimeframe | string;
  aiProcessed?: boolean;
  className?: string;
}) {
  const { user } = useAuth();
  const isOfficer = user?.role === "admin";

  const department = DEPARTMENTS[category];
  // Older records may predate the structured timeframe — derive it from the
  // AI-assigned priority so citizens never see a blank timeline.
  const timeframe =
    resolutionTimeframe && resolutionTimeframe.length > 0
      ? resolutionTimeframe
      : TIMEFRAME_BY_PRIORITY[priority];

  if (isOfficer) {
    if (!recommendedResolution) return null;
    return (
      <div className={`rounded-xl border border-info/25 bg-info-soft/60 p-4 ${className}`}>
        <p className="text-xs font-bold uppercase tracking-wide text-info">
          🤖 AI-Recommended Resolution Steps
          {aiProcessed ? "" : " (heuristic fallback)"}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink">{recommendedResolution}</p>
        <p className="mt-2 text-xs text-muted">
          Estimated resolution time: {timeframe} · {department}
        </p>
      </div>
    );
  }

  // Citizen / public view: routing plus expected timeline, no internal detail.
  return (
    <div className={`rounded-xl border border-info/25 bg-info-soft/60 p-4 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-info">
        🤖 AI-Recommended Resolution
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink">
        Routed to {department}. Expected resolution: {timeframe}.
      </p>
    </div>
  );
}
