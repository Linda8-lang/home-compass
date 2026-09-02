import { createFileRoute } from "@tanstack/react-router";
import { booleanPointInPolygon } from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import {
  GEOCODE_LIMITS,
  overGeocodeIpBudget,
  getCachedGeocode,
  setCachedGeocode,
  type GeocodeResult,
} from "@/lib/geocode-limits";
import boundariesJson from "@/data/generated/toronto-neighbourhoods.json";

// Declared independently of scripts/ingest/schemas/boundaries.ts — see the doc
// comment at the top of src/data/generated/neighbourhood-lookup.ts for why: that
// schema package lives outside src/ and isn't bundled, and this JSON is already
// zod-validated at ingestion time.
type BoundaryGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };
type BoundaryFeature = { hood_id: number; area_name: string; geometry: BoundaryGeometry };
const boundaries = boundariesJson as unknown as { features: BoundaryFeature[] };

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function jsonResponse(value: unknown) {
  return new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json" },
  });
}

type NominatimResult = { lat: string; lon: string };

/**
 * Nominatim's usage policy requires a descriptive User-Agent identifying the
 * calling app for abuse follow-up — never call it without one.
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", `${address}, Toronto, ON, Canada`);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "ca");

  const upstream = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "home-compass-housing-assistant (Check the Place; github.com/Linda8-lang/home-compass)",
    },
  });

  if (!upstream.ok) {
    throw new Error(`Nominatim returned HTTP ${upstream.status}`);
  }

  const results = (await upstream.json()) as NominatimResult[];
  const first = results[0];
  if (!first) return null;

  const lat = Number(first.lat);
  const lon = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

/** First matching neighbourhood polygon wins — Toronto's 158 neighbourhoods don't overlap. */
function findHoodForPoint(lat: number, lon: number): { hoodId: number; areaName: string } | null {
  const pt = point([lon, lat]);
  for (const feature of boundaries.features) {
    if (booleanPointInPolygon(pt, feature.geometry)) {
      return { hoodId: feature.hood_id, areaName: feature.area_name };
    }
  }
  return null;
}

export const Route = createFileRoute("/api/geocode")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { address?: string };
        try {
          body = (await request.json()) as { address?: string };
        } catch {
          return errorResponse("Invalid request.", 400);
        }

        const address = typeof body.address === "string" ? body.address.trim().slice(0, 200) : "";
        if (!address) {
          return errorResponse("No address provided.", 400);
        }

        // Cache is checked before the IP budget so repeat lookups of the same
        // address (including saved-places re-lookups) never cost budget.
        const cached = getCachedGeocode(address);
        if (cached !== undefined) {
          return jsonResponse(cached);
        }

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        if (overGeocodeIpBudget(ip)) {
          return errorResponse("Hourly usage limit reached — please try again later.", 429);
        }

        let coords: { lat: number; lon: number } | null;
        try {
          coords = await geocodeAddress(address);
        } catch (err) {
          // Transient network/upstream failures are never cached — a bad Nominatim
          // moment shouldn't poison the cache with a false negative.
          console.error("geocode upstream error", err);
          return errorResponse(
            "The address lookup service is unavailable right now — try again shortly.",
            502,
          );
        }

        if (!coords) {
          setCachedGeocode(address, null);
          return jsonResponse(null);
        }

        const hood = findHoodForPoint(coords.lat, coords.lon);
        const result: GeocodeResult | null = hood
          ? { hoodId: hood.hoodId, areaName: hood.areaName, lat: coords.lat, lon: coords.lon }
          : null;

        setCachedGeocode(address, result);
        return jsonResponse(result);
      },
    },
  },
});
