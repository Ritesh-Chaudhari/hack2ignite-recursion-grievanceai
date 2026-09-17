import { memo } from "react";
import type { Category, GrievanceLanguage, Priority, Status } from "@/lib/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  Urgent: "bg-danger-soft text-danger border-danger/25",
  High: "bg-warn-soft text-warn border-warn/25",
  Medium: "bg-info-soft text-info border-info/25",
  Low: "bg-ok-soft text-ok border-ok/25",
};

const STATUS_STYLES: Record<Status, string> = {
  Pending: "bg-warn-soft text-warn border-warn/25",
  "In Progress": "bg-info-soft text-info border-info/25",
  Resolved: "bg-ok-soft text-ok border-ok/25",
};

const CATEGORY_STYLES: Record<Category, string> = {
  Water: "bg-sky-100 text-sky-700 border-sky-200",
  Roads: "bg-orange-100 text-orange-700 border-orange-200",
  Electricity: "bg-amber-100 text-amber-700 border-amber-200",
  Sanitation: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Safety: "bg-rose-100 text-rose-700 border-rose-200",
  Other: "bg-slate-100 text-slate-600 border-slate-200",
};

const LANGUAGE_LABELS: Record<GrievanceLanguage, string> = {
  English: "English",
  Hindi: "हिंदी",
  Marathi: "मराठी",
};

export const PriorityBadge = memo(function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${PRIORITY_STYLES[priority]} ${
        priority === "Urgent" ? "animate-pulse-ring" : ""
      }`}
    >
      {priority === "Urgent" && <span className="h-1.5 w-1.5 rounded-full bg-danger" />}
      {priority}
    </span>
  );
});

export const StatusBadge = memo(function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
});

export const CategoryBadge = memo(function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category]}`}
    >
      {category}
    </span>
  );
});

export const LanguageBadge = memo(function LanguageBadge({ language }: { language: GrievanceLanguage }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-canvas px-2.5 py-0.5 text-xs font-medium text-muted">
      {LANGUAGE_LABELS[language]}
    </span>
  );
});
