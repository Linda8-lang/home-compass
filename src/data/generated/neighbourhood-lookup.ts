/**
 * Read-side of the two ingested JSON files (see scripts/ingest/ for how they're
 * produced). Types here are declared independently of scripts/ingest/schemas/*.ts —
 * that package lives outside src/, isn't bundled, and the JSON is already
 * zod-validated at ingestion time, so re-importing zod into the client app would
 * add nothing but a dependency edge.
 *
 * The two files are joined by hood_id, never by area_name: TPS and CKAN publish
 * slightly different punctuation for 7 of 158 neighbourhood names (e.g.
 * "Yonge-St.Clair" vs "Yonge-St. Clair"), but hood_id matches 1:1 across both.
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
