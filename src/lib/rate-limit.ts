/**
 * Simple in-memory rate limiter.
 *
 * Tracks request counts per key (e.g. IP address) within a sliding window.
 * Suitable for a prototype; swap for Redis-backed limiter in production.
 */

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

// Periodically clean up expired entries to prevent memory leaks.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 60_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check (and increment) the rate limit for a given key.
 *
 * @param key       Unique identifier (e.g. IP address or email).
 * @param limit     Max requests allowed in the window.
 * @param windowMs  Window duration in milliseconds.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // New window
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  entry.count += 1;
  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining, resetAt: entry.resetAt };
}

/**
 * Extract a rate-limit key from a request (IP address).
 */
export function getClientIp(request: Request): string {
  // Vercel / Cloudflare / Next.js edge
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "127.0.0.1";
}
