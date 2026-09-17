import type { Grievance } from "@/lib/types";

/**
 * Convert a list of grievances to a CSV string.
 */
export function grievancesToCsv(grievances: Grievance[]): string {
  const headers = [
    "ID",
    "Title",
    "Description",
    "Language",
    "Category",
    "Priority",
    "Status",
    "Location",
    "Submitted By",
    "Submitter Name",
    "Created At",
    "Updated At",
    "AI Summary",
    "AI Processed",
  ];

  const rows = grievances.map((g) => [
    g.id,
    escapeCsvField(g.title),
    escapeCsvField(g.description),
    g.language,
    g.category,
    g.priority,
    g.status,
    escapeCsvField(g.location),
    g.submittedBy,
    escapeCsvField(g.submitterName),
    g.createdAt,
    g.updatedAt,
    escapeCsvField(g.aiSummary),
    g.aiProcessed ? "Yes" : "No",
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

/**
 * Escape a CSV field (wrap in quotes if it contains commas, quotes, or newlines).
 */
function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Trigger a browser download of the CSV file.
 */
export function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
