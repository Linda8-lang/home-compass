import path from "node:path";
import ExcelJS from "exceljs";
import { fetchValidated } from "../lib/fetch-validated.ts";
import { loadWorkbookFromBytes } from "../lib/load-workbook.ts";
import { writeValidatedJsonAtomic, markExistingFileStale } from "../lib/atomic-write.ts";
import { logIngestionError } from "../lib/log.ts";
import { rentBenchmarksSchema, type RentBenchmarks } from "../schemas/rent.ts";
import { CKAN_NEIGHBOURHOOD_PROFILES_XLSX, OUTPUT_DIR } from "../config.ts";

const LIVE_PATH = path.join(OUTPUT_DIR, "rent_benchmarks.json");

// Exact row labels in the City of Toronto 2021 Census Neighbourhood Profile
// (158-model) sheet `hd2021_census_profile`, column 1. Verified against the
// live file — rows 1/2/372/380 as of the 2021-census edition.
const NAME_ROW_LABEL = "neighbourhood name";
const NUMBER_ROW_LABEL = "neighbourhood number";
const OWNER_SHELTER_LABEL = "median monthly shelter costs for owned dwellings ($)";
const RENTER_SHELTER_LABEL = "median monthly shelter costs for rented dwellings ($)";

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "richText" in value) {
    return (value as { richText: { text: string }[] }).richText.map((t) => t.text).join("");
  }
  return String(value);
}

function cellNumber(value: ExcelJS.CellValue): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const n = Number(cellText(value).replace(/[$,]/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

export async function ingestRent(): Promise<void> {
  try {
    const { body } = await fetchValidated(CKAN_NEIGHBOURHOOD_PROFILES_XLSX, [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream",
    ]);

    const workbook = await loadWorkbookFromBytes(body);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error("XLSX has no worksheets");

    let nameRow: ExcelJS.Row | undefined;
    let numberRow: ExcelJS.Row | undefined;
    let renterRow: ExcelJS.Row | undefined;
    let ownerRow: ExcelJS.Row | undefined;

    sheet.eachRow((row) => {
      const label = cellText(row.getCell(1).value).trim().toLowerCase();
      if (label === NAME_ROW_LABEL) nameRow = row;
      else if (label === NUMBER_ROW_LABEL) numberRow = row;
      else if (label === RENTER_SHELTER_LABEL) renterRow = row;
      else if (label === OWNER_SHELTER_LABEL) ownerRow = row;
    });

    if (!nameRow || !numberRow || !renterRow) {
      throw new Error(
        `Could not locate expected rows in neighbourhood profile sheet (name=${!!nameRow} number=${!!numberRow} renter=${!!renterRow}) — source layout may have changed`,
      );
    }

    const neighbourhoods: RentBenchmarks["neighbourhoods"] = [];
    const lastCol = nameRow.cellCount;
    for (let col = 2; col <= lastCol; col++) {
      const areaName = cellText(nameRow.getCell(col).value).trim();
      if (!areaName) continue;
      const hoodIdRaw = cellNumber(numberRow.getCell(col).value);
      neighbourhoods.push({
        area_name: areaName,
        hood_id: hoodIdRaw == null ? null : Math.trunc(hoodIdRaw),
        median_renter_shelter_cost: cellNumber(renterRow.getCell(col).value),
        median_owner_shelter_cost: ownerRow ? cellNumber(ownerRow.getCell(col).value) : null,
      });
    }

    if (neighbourhoods.length === 0) {
      throw new Error("Parsed zero neighbourhoods from CKAN neighbourhood profile XLSX");
    }

    const data: RentBenchmarks = {
      data_status: "ok",
      data_level: "neighbourhood",
      last_updated: new Date().toISOString(),
      source: {
        name: "City of Toronto Open Data — Neighbourhood Profiles (2021 Census, 158-model)",
        endpoint: CKAN_NEIGHBOURHOOD_PROFILES_XLSX,
        disclaimer:
          "Median monthly shelter cost from the 2021 Census is used as a neighbourhood-level rent proxy. It is refreshed roughly every 5 years on the census cycle, so it lags current market rent — pair it with the CMHC annual baseline rather than treating it as a live asking-rent figure.",
      },
      neighbourhoods,
    };

    writeValidatedJsonAtomic(LIVE_PATH, data, rentBenchmarksSchema);
    console.log(`[ingest:rent] OK — wrote ${neighbourhoods.length} neighbourhoods`);
  } catch (err) {
    logIngestionError({
      source: "rent_benchmarks (CKAN)",
      endpoint: CKAN_NEIGHBOURHOOD_PROFILES_XLSX,
      timestamp: new Date().toISOString(),
      reason: err instanceof Error ? err.message : String(err),
    });
    markExistingFileStale(LIVE_PATH);
    throw err;
  }
}
