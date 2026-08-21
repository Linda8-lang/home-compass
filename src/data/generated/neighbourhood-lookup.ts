/**
 * Read-side of the ingested JSON files (see scripts/ingest/ for how they're
 * produced). Types here are declared independently of scripts/ingest/schemas/*.ts —
 * that package lives outside src/, isn't bundled, and the JSON is already
 * zod-validated at ingestion time, so re-importing zod into the client app would
 * add nothing but a dependency edge.
 *
 * The two neighbourhood-level files are joined by hood_id, never by area_name: TPS
 * and CKAN publish slightly different punctuation for 7 of 158 neighbourhood names
 * (e.g. "Yonge-St.Clair" vs "Yonge-St. Clair"), but hood_id matches 1:1 across both.
 *
 * cmhc_baseline.json is a third, optional source: it's only written once
 * `npm run ingest:cmhc` has a CMHC_XLSX_URL configured (see scripts/ingest/config.ts),
 * so as of this writing the file does not exist yet. It's read via import.meta.glob
 * instead of a static import so a missing file is an empty-object case at build time,
 * not a broken import — the moment the file appears, this starts picking it up with
 * no code change. It also publishes at zone/city level only (data_level: "city"), and
 * nothing in this app maps a CMHC zone_name to a hood_id, so it is never attributed
 * to a specific neighbourhood below — only shown as a city-wide range.
 */
import safetyIndices from "./safety_indices.json";
import rentBenchmarks from "./rent_benchmarks.json";

export type DataStatus = "ok" | "stale" | "fallback_city_level";
export type DataLevel = "neighbourhood" | "city";
export type DataSource = { name: string; endpoint: string; disclaimer: string };

export type OffenceStat = { count: number | null; rate_per_100k: number | null };
export type NeighbourhoodSafety = {
  area_name: string;
  hood_id: number;
  population: number | null;
  offences: Record<string, OffenceStat>;
};
export type NeighbourhoodRent = {
  area_name: string;
  hood_id: number | null;
  median_renter_shelter_cost: number | null;
  median_owner_shelter_cost: number | null;
};

export type NeighbourhoodSnapshot = {
  hoodId: number;
  /** Always the safety file's spelling — the canonical display label. */
  areaName: string;
  safety: NeighbourhoodSafety | null;
  rent: NeighbourhoodRent | null;
};

const rentByHoodId = new Map<number, NeighbourhoodRent>();
for (const entry of rentBenchmarks.neighbourhoods as NeighbourhoodRent[]) {
  if (entry.hood_id != null) rentByHoodId.set(entry.hood_id, entry);
}

export const NEIGHBOURHOOD_SNAPSHOTS: NeighbourhoodSnapshot[] = (
  safetyIndices.neighbourhoods as NeighbourhoodSafety[]
)
  .map((safety) => ({
    hoodId: safety.hood_id,
    areaName: safety.area_name,
    safety,
    rent: rentByHoodId.get(safety.hood_id) ?? null,
  }))
  .sort((a, b) => a.areaName.localeCompare(b.areaName));

export const NEIGHBOURHOOD_BY_ID: Map<number, NeighbourhoodSnapshot> = new Map(
  NEIGHBOURHOOD_SNAPSHOTS.map((n) => [n.hoodId, n]),
);

export const SAFETY_META: {
  status: DataStatus;
  level: DataLevel;
  lastUpdated: string;
  source: DataSource;
} = {
  status: safetyIndices.data_status as DataStatus,
  level: safetyIndices.data_level as DataLevel,
  lastUpdated: safetyIndices.last_updated,
  source: safetyIndices.source,
};

export const RENT_META: {
  status: DataStatus;
  level: DataLevel;
  lastUpdated: string;
  source: DataSource;
} = {
  status: rentBenchmarks.data_status as DataStatus,
  level: rentBenchmarks.data_level as DataLevel,
  lastUpdated: rentBenchmarks.last_updated,
  source: rentBenchmarks.source,
};

/**
 * Population-weighted city-wide rate for each offence type, derived from the same
 * TPS neighbourhoods array above (sum of counts / sum of population * 100k) — not a
 * separate source, just an aggregate over the real per-neighbourhood figures. Used as
 * the "Toronto Average" comparison column; skips any neighbourhood missing a count or
 * population for that offence rather than treating a null as zero.
 */
export const CITYWIDE_OFFENCE_RATES: Record<string, number | null> = (() => {
  const totals = new Map<string, { count: number; population: number }>();
  for (const n of safetyIndices.neighbourhoods as NeighbourhoodSafety[]) {
    if (n.population == null) continue;
    for (const [offence, stat] of Object.entries(n.offences)) {
      if (stat.count == null) continue;
      const t = totals.get(offence) ?? { count: 0, population: 0 };
      t.count += stat.count;
      t.population += n.population;
      totals.set(offence, t);
    }
  }
  const rates: Record<string, number | null> = {};
  for (const [offence, t] of totals) {
    rates[offence] = t.population > 0 ? (t.count / t.population) * 100_000 : null;
  }
  return rates;
})();

export type RentRange = { min: number; max: number };

/** Min/max of median_renter_shelter_cost across all 158 neighbourhoods — real spread, not a per-neighbourhood range (CKAN publishes one median figure per neighbourhood, not by bedroom count). */
export const CKAN_RENT_RANGE: RentRange | null = (() => {
  const values = (rentBenchmarks.neighbourhoods as NeighbourhoodRent[])
    .map((r) => r.median_renter_shelter_cost)
    .filter((v): v is number => v != null);
  return values.length > 0 ? { min: Math.min(...values), max: Math.max(...values) } : null;
})();

/* ---------------------------------------------------------------------- */
/* CMHC baseline (optional third source — see file header)                 */
/* ---------------------------------------------------------------------- */

type CmhcZoneStat = {
  zone_name: string;
  bachelor_avg_rent: number | null;
  one_bed_avg_rent: number | null;
  two_bed_avg_rent: number | null;
  three_bed_plus_avg_rent: number | null;
  vacancy_rate_pct: number | null;
};
type CmhcBaselineFile = {
  data_status: DataStatus;
  data_level: DataLevel;
  last_updated: string;
  source: DataSource;
  zones: CmhcZoneStat[];
};

const cmhcModules = import.meta.glob<{ default: CmhcBaselineFile }>("./cmhc_baseline.json", {
  eager: true,
});
const cmhcBaselineFile = Object.values(cmhcModules)[0]?.default ?? null;

export const CMHC_META: {
  status: DataStatus;
  level: DataLevel;
  lastUpdated: string;
  source: DataSource;
} | null = cmhcBaselineFile && {
  status: cmhcBaselineFile.data_status,
  level: cmhcBaselineFile.data_level,
  lastUpdated: cmhcBaselineFile.last_updated,
  source: cmhcBaselineFile.source,
};

function cmhcRange(pick: (z: CmhcZoneStat) => number | null): RentRange | null {
  if (!cmhcBaselineFile) return null;
  const values = cmhcBaselineFile.zones.map(pick).filter((v): v is number => v != null);
  return values.length > 0 ? { min: Math.min(...values), max: Math.max(...values) } : null;
}

/** City-wide range across CMHC zones (not neighbourhood-specific — see file header). Both null until cmhc_baseline.json exists. */
export const CMHC_CITYWIDE_RANGE: { oneBed: RentRange | null; twoBed: RentRange | null } = {
  oneBed: cmhcRange((z) => z.one_bed_avg_rent),
  twoBed: cmhcRange((z) => z.two_bed_avg_rent),
};

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * No geocoding pipeline exists anywhere in this app — by design, the product has no
 * street-level listing/address database (see docs/user-and-data-flow.md, "What is
 * never sent" / "no listing or market data"). This resolves a typed address to a
 * neighbourhood only when one of the 158 known neighbourhood names appears
 * (punctuation/case-insensitively) inside the typed text, e.g.
 * "10 St Clair Ave W, Yonge-St.Clair, Toronto" matches "Yonge-St.Clair". It is not a
 * street-level geocoder: an address that omits the neighbourhood name will not
 * resolve, by design — see the "not enough data for this area" state in the UI.
 */
export function matchNeighbourhoodByText(input: string): NeighbourhoodSnapshot | null {
  const normalizedInput = normalizeForMatch(input);
  if (!normalizedInput) return null;
  const candidates = NEIGHBOURHOOD_SNAPSHOTS.filter((n) =>
    normalizedInput.includes(normalizeForMatch(n.areaName)),
  );
  if (candidates.length === 0) return null;
  // Longest name wins so a short name doesn't shadow a longer one that contains it.
  candidates.sort((a, b) => b.areaName.length - a.areaName.length);
  return candidates[0]!;
}
