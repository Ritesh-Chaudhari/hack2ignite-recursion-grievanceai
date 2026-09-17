import type { Priority, Status } from "@/lib/types";

/**
 * SLA (Service Level Agreement) configuration.
 * Maps each priority level to the maximum allowed resolution time in hours.
 */
export const SLA_HOURS: Record<Priority, number> = {
  Urgent: 24,    // Must be resolved within 24 hours
  High: 72,      // 3 days
  Medium: 168,   // 7 days
  Low: 336,      // 14 days
};

/**
 * Check whether a grievance has breached its SLA.
 * Returns null if still within SLA, or the number of hours overdue.
 */
export function checkSlaBreach(
  createdAt: string,
  priority: Priority,
  status: Status,
): number | null {
  if (status === "Resolved") return null; // Already resolved, no breach
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsedHours = (now - created) / (1000 * 60 * 60);
  const deadline = SLA_HOURS[priority];
  if (elapsedHours <= deadline) return null;
  return Math.round(elapsedHours - deadline);
}

/**
 * Get the SLA deadline date for a grievance.
 */
export function getSlaDeadline(createdAt: string, priority: Priority): Date {
  return new Date(
    new Date(createdAt).getTime() + SLA_HOURS[priority] * 60 * 60 * 1000,
  );
}

/**
 * Format SLA status as a human-readable string.
 */
export function formatSlaStatus(
  createdAt: string,
  priority: Priority,
  status: Status,
): { text: string; breached: boolean } {
  const breachHours = checkSlaBreach(createdAt, priority, status);
  if (breachHours === null) {
    const deadline = getSlaDeadline(createdAt, priority);
    const hoursLeft = Math.round(
      (deadline.getTime() - Date.now()) / (1000 * 60 * 60),
    );
    if (status === "Resolved") {
      return { text: "Resolved", breached: false };
    }
    if (hoursLeft > 24) {
      return { text: `${Math.round(hoursLeft / 24)}d remaining`, breached: false };
    }
    return { text: `${hoursLeft}h remaining`, breached: false };
  }
  if (breachHours > 24) {
    return { text: `Overdue by ${Math.round(breachHours / 24)}d`, breached: true };
  }
  return { text: `Overdue by ${breachHours}h`, breached: true };
}
