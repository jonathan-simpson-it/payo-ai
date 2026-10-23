/** Simple in-memory sliding-window rate limiter for the authoring endpoints. */

const buckets = new Map<string, number[]>();

export interface RateResult {
  allowed: boolean;
  retryAfterSec: number;
}

export function checkRateLimit(key: string, limit = 10, windowMs = 60_000): RateResult {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    const oldest = hits[0] ?? now;
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
  }
  hits.push(now);
  buckets.set(key, hits);
  return { allowed: true, retryAfterSec: 0 };
}
