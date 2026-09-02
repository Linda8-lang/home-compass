/**
 * Cost-control + caching for the address geocoding endpoint (src/routes/api/geocode.ts).
 * Mirrors the in-memory Map pattern used for the AI Advisor's per-IP budget
 * (src/routes/api/advisor.ts) — best-effort only, resets on redeploy / per worker
 * instance, but stops a single client from hammering Nominatim (whose usage policy
 * requires low-volume, non-bulk use) and makes repeat lookups of the same address free.
 */
export const GEOCODE_LIMITS = {
  /** Server-side per-IP request budget. */
  ipWindowMs: 60 * 60 * 1000,
  maxRequestsPerIpPerWindow: 20,
  /** How long a cached geocode result — including a negative (no match) one — stays fresh. */
  cacheTtlMs: 24 * 60 * 60 * 1000,
} as const;

const ipHits = new Map<string, number[]>();

export function overGeocodeIpBudget(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < GEOCODE_LIMITS.ipWindowMs);
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 5000) ipHits.clear();
  return hits.length > GEOCODE_LIMITS.maxRequestsPerIpPerWindow;
}

export type GeocodeResult = { hoodId: number; areaName: string; lat: number; lon: number };

type CacheEntry = { value: GeocodeResult | null; expiresAt: number };

const cache = new Map<string, CacheEntry>();

function cacheKey(address: string): string {
  return address.trim().toLowerCase();
}

/**
 * Returns `undefined` when nothing usable is cached (never looked up, or expired) —
 * distinct from `null`, which means a prior lookup was cached as a negative (no
 * neighbourhood match) result and should not be retried against Nominatim.
 */
export function getCachedGeocode(address: string): GeocodeResult | null | undefined {
  const key = cacheKey(address);
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

export function setCachedGeocode(address: string, value: GeocodeResult | null): void {
  if (cache.size > 5000) cache.clear();
  cache.set(cacheKey(address), { value, expiresAt: Date.now() + GEOCODE_LIMITS.cacheTtlMs });
}
