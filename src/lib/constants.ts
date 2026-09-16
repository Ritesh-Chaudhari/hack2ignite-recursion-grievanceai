import type {
  Category,
  GrievanceLanguage,
  Priority,
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
