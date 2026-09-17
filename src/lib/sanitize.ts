/**
 * Input sanitization utilities.
 *
 * Strips potentially dangerous HTML/script content from user-submitted text
 * before storage. This is a defense-in-depth measure — the UI also escapes
 * output via React's JSX rendering, but sanitizing on input adds a safety net.
 */

/**
 * Strip HTML tags and normalize whitespace.
 * Keeps only plain text — no markup, no entities.
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&[a-zA-Z]+;/g, " ") // Remove HTML entities like &amp; &lt;
    .replace(/&#\d+;/g, " ") // Remove numeric entities
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

/**
 * Sanitize a text field: strip HTML, trim, enforce max length.
 */
export function sanitizeText(input: string, maxLength = 5000): string {
  return stripHtml(input).slice(0, maxLength);
}

/**
 * Sanitize a grievance title (shorter max).
 */
export function sanitizeTitle(input: string): string {
  return sanitizeText(input, 200);
}

/**
 * Sanitize a grievance description (longer max).
 */
export function sanitizeDescription(input: string): string {
  return sanitizeText(input, 5000);
}

/**
 * Sanitize a location field.
 */
export function sanitizeLocation(input: string): string {
  return sanitizeText(input, 200);
}
