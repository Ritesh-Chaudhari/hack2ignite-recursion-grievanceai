import type {
  Category,
  GrievanceLanguage,
  Priority,
  ResolutionTimeframe,
  Status,
} from "@/lib/types";

export const APP_NAME = "Grievance AI";

export const CATEGORIES: Category[] = [
  "Water",
  "Roads",
  "Electricity",
  "Sanitation",
  "Safety",
  "Other",
];

export const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Urgent"];

export const STATUSES: Status[] = ["Pending", "In Progress", "Resolved"];

export const LANGUAGES: GrievanceLanguage[] = ["English", "Hindi", "Marathi"];

/** Maps an AI category to the responsible municipal department. */
export const DEPARTMENTS: Record<Category, string> = {
  Water: "Water Supply & Sewerage Department",
  Roads: "Roads & Infrastructure Department",
  Electricity: "Electricity Board",
  Sanitation: "Sanitation & Waste Management Department",
  Safety: "Public Safety Department",
  Other: "General Administration Department",
};

/** Sort weight so admin lists can order Urgent → Low. */
export const PRIORITY_WEIGHT: Record<Priority, number> = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

/**
 * Priority → estimated resolution window.
 *
 * Used when Gemini is unavailable, and to backfill records created before
 * `resolutionTimeframe` existed, so the citizen-facing summary always has a
 * value to show without a second AI call.
 */
export const TIMEFRAME_BY_PRIORITY: Record<Priority, ResolutionTimeframe> = {
  Urgent: "24 hours",
  High: "2-3 days",
  Medium: "About a week",
  Low: "Within two weeks",
};
