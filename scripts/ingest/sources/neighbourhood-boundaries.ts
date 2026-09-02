import path from "node:path";
import { fetchValidated } from "../lib/fetch-validated.ts";
import { writeValidatedJsonAtomic, markExistingFileStale } from "../lib/atomic-write.ts";
import { logIngestionError } from "../lib/log.ts";
import {
  neighbourhoodBoundariesSchema,
  type NeighbourhoodBoundaries,
} from "../schemas/boundaries.ts";
import { CKAN_ACTION_BASE, TORONTO_NEIGHBOURHOODS_CKAN_PACKAGE_ID, OUTPUT_DIR } from "../config.ts";

const LIVE_PATH = path.join(OUTPUT_DIR, "toronto-neighbourhoods.json");

type CkanResource = {
  url?: string;
  format?: string;
  name?: string;
};

type CkanPackageShowResponse = {
  success?: boolean;
  result?: { resources?: CkanResource[] };
};

type GeoJsonFeature = {
  type?: string;
  properties?: Record<string, unknown>;
  geometry?: { type?: string; coordinates?: unknown };
};

type GeoJsonFeatureCollection = {
  type?: string;
  features?: GeoJsonFeature[];
};

function numOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * CKAN rotates the GeoJSON resource's UUID (and therefore its download URL) on this
 * package independently of the stable package id, so the resource URL is resolved
 * at ingest time via package_show rather than hardcoded in config.ts.
 */
async function resolveGeoJsonResourceUrl(): Promise<string> {
  const packageShowUrl = new URL(`${CKAN_ACTION_BASE}/package_show`);
  packageShowUrl.searchParams.set("id", TORONTO_NEIGHBOURHOODS_CKAN_PACKAGE_ID);

  const { body } = await fetchValidated(packageShowUrl.toString(), ["application/json"]);
  const payload = JSON.parse(new TextDecoder().decode(body)) as CkanPackageShowResponse;

  if (!payload.success || !payload.result) {
    throw new Error(
      `CKAN package_show did not return a successful result for "${TORONTO_NEIGHBOURHOODS_CKAN_PACKAGE_ID}"`,
    );
  }

  const resources = payload.result.resources ?? [];
  // This package also lists a "GeoJSON"-labelled datastore-dump resource that
  // actually serves CSV by default, plus a "historical 140" boundary edition and
  // reprojected (non-4326) variants. An actual downloadable .geojson file, whose
  // name doesn't reference the historical edition, is the current WGS84 boundary set.
  const geoJsonResource = resources.find(
    (r) =>
      (r.format ?? "").toUpperCase() === "GEOJSON" &&
      (r.url ?? "").toLowerCase().endsWith(".geojson") &&
      !/historical/i.test(r.name ?? ""),
  );
  if (!geoJsonResource?.url) {
    throw new Error(
      `No current GeoJSON resource found in CKAN package "${TORONTO_NEIGHBOURHOODS_CKAN_PACKAGE_ID}"`,
    );
  }
  return geoJsonResource.url;
}

export async function ingestBoundaries(): Promise<void> {
  let endpoint = `${CKAN_ACTION_BASE}/package_show?id=${TORONTO_NEIGHBOURHOODS_CKAN_PACKAGE_ID}`;

  try {
    const resourceUrl = await resolveGeoJsonResourceUrl();
    endpoint = resourceUrl;

    const { body } = await fetchValidated(resourceUrl, [
      "application/json",
      "application/geo+json",
      "text/plain",
      // The City of Toronto's CDN serves .geojson downloads under this generic
      // type rather than an application/json or geo+json Content-Type.
      "application/octet-stream",
    ]);
    const geojson = JSON.parse(new TextDecoder().decode(body)) as GeoJsonFeatureCollection;

    if (!Array.isArray(geojson.features)) {
      throw new Error("Missing 'features' array in neighbourhoods GeoJSON response");
    }

    const features: NeighbourhoodBoundaries["features"] = [];
    for (const feature of geojson.features) {
      const geometry = feature.geometry;
      if (geometry?.type !== "Polygon" && geometry?.type !== "MultiPolygon") continue;

      const props = feature.properties ?? {};
      // Different exports of this dataset use different property names for the
      // same neighbourhood id/name — check each in turn. AREA_SHORT_CODE is what
      // the current CKAN GeoJSON export actually uses (a numeric string).
      const hoodId = numOrNull(props["HOOD_ID"] ?? props["AREA_S_CD"] ?? props["AREA_SHORT_CODE"]);
      const areaName = String(props["AREA_NAME"] ?? props["AREA_NA7"] ?? "").trim();
      if (hoodId == null || !areaName) continue;

      features.push({
        hood_id: Math.trunc(hoodId),
        area_name: areaName,
        // Coordinate arrays are validated (ring/position shape) by the zod schema
        // at writeValidatedJsonAtomic below — this cast just satisfies TS, which
        // can't narrow a JSON `unknown` shape to the schema's tuple-typed positions.
        geometry: geometry as NeighbourhoodBoundaries["features"][number]["geometry"],
      });
    }

    if (features.length === 0) {
      throw new Error("Parsed zero neighbourhood boundaries from CKAN GeoJSON response");
    }

    const data: NeighbourhoodBoundaries = {
      data_status: "ok",
      data_level: "neighbourhood",
      last_updated: new Date().toISOString(),
      source: {
        name: "City of Toronto Open Data — Neighbourhoods (boundary polygons)",
        endpoint,
        disclaimer:
          "Neighbourhood boundary polygons published by the City of Toronto, used only for point-in-polygon lookup. Joined to TPS crime data and CKAN rent benchmarks by hood_id, not area_name.",
      },
      features,
    };

    writeValidatedJsonAtomic(LIVE_PATH, data, neighbourhoodBoundariesSchema);
    console.log(`[ingest:boundaries] OK — wrote ${features.length} neighbourhood boundaries`);
  } catch (err) {
    logIngestionError({
      source: "toronto_neighbourhoods (CKAN)",
      endpoint,
      timestamp: new Date().toISOString(),
      reason: err instanceof Error ? err.message : String(err),
    });
    markExistingFileStale(LIVE_PATH);
    throw err;
  }
}
