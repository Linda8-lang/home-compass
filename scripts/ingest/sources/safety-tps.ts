import path from "node:path";
import { fetchValidated } from "../lib/fetch-validated.ts";
import { writeValidatedJsonAtomic, markExistingFileStale } from "../lib/atomic-write.ts";
import { logIngestionError } from "../lib/log.ts";
import { safetyIndicesSchema, OFFENCE_TYPES, type SafetyIndices } from "../schemas/safety.ts";
import { TPS_SAFETY_ENDPOINT, OUTPUT_DIR } from "../config.ts";

const LIVE_PATH = path.join(OUTPUT_DIR, "safety_indices.json");

// Most recent per-offence year column published in the FeatureServer's field
// names (e.g. ASSAULT_2025, ASSAULT_RATE_2025). TPS appends a new year yearly;
// bump this when the source schema rolls over to the next year.
const LATEST_YEAR = 2025;

const OFFENCE_FIELD_PREFIX: Record<(typeof OFFENCE_TYPES)[number], string> = {
  assault: "ASSAULT",
  auto_theft: "AUTOTHEFT",
  bike_theft: "BIKETHEFT",
  break_enter: "BREAKENTER",
  homicide: "HOMICIDE",
  robbery: "ROBBERY",
  shooting: "SHOOTING",
  theft_over: "THEFTOVER",
  theft_from_motor_vehicle: "THEFTFROMMV",
};

function numOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function ingestSafety(): Promise<void> {
  const url = new URL(TPS_SAFETY_ENDPOINT);
  url.searchParams.set("where", "1=1");
  url.searchParams.set("outFields", "*");
  url.searchParams.set("outSR", "4326");
  url.searchParams.set("f", "json");

  try {
    const { body } = await fetchValidated(url.toString(), ["application/json", "text/plain"]);
    const payload = JSON.parse(new TextDecoder().decode(body)) as {
      error?: unknown;
      features?: { attributes?: Record<string, unknown> }[];
    };

    if (payload.error) {
      throw new Error(`ArcGIS error: ${JSON.stringify(payload.error)}`);
    }
    if (!Array.isArray(payload.features)) {
      throw new Error("Missing 'features' array in ArcGIS response");
    }

    const neighbourhoods: SafetyIndices["neighbourhoods"] = [];
    for (const feature of payload.features) {
      const attrs = feature.attributes ?? {};
      const areaName = String(attrs["AREA_NAME"] ?? "").trim();
      const hoodId = numOrNull(attrs["HOOD_ID"]);
      if (!areaName || hoodId == null) continue;

      const offences = {} as SafetyIndices["neighbourhoods"][number]["offences"];
      for (const type of OFFENCE_TYPES) {
        const prefix = OFFENCE_FIELD_PREFIX[type];
        offences[type] = {
          count: numOrNull(attrs[`${prefix}_${LATEST_YEAR}`]),
          rate_per_100k: numOrNull(attrs[`${prefix}_RATE_${LATEST_YEAR}`]),
        };
      }

      neighbourhoods.push({
        area_name: areaName,
        hood_id: Math.trunc(hoodId),
        population: numOrNull(attrs[`POPULATION_${LATEST_YEAR}`]),
        offences,
      });
    }

    if (neighbourhoods.length === 0) {
      throw new Error("Parsed zero neighbourhoods from TPS ArcGIS response");
    }

    const data: SafetyIndices = {
      data_status: "ok",
      data_level: "neighbourhood",
      last_updated: new Date().toISOString(),
      source: {
        name: "Toronto Police Service — Neighbourhood Crime Rates Open Data",
        endpoint: TPS_SAFETY_ENDPOINT,
        disclaimer:
          "Crime locations are spatially offset by the Toronto Police Service to a nearby intersection or the centre of the block to protect victim/witness privacy. Counts reflect reported occurrences, not convictions, and rates are per 100,000 residents using Environics Analytics projected population.",
      },
      neighbourhoods,
    };

    writeValidatedJsonAtomic(LIVE_PATH, data, safetyIndicesSchema);
    console.log(`[ingest:safety] OK — wrote ${neighbourhoods.length} neighbourhoods`);
  } catch (err) {
    logIngestionError({
      source: "safety_indices (TPS)",
      endpoint: url.toString(),
      timestamp: new Date().toISOString(),
      reason: err instanceof Error ? err.message : String(err),
    });
    markExistingFileStale(LIVE_PATH);
    throw err;
  }
}
