import path from "node:path";
import ExcelJS from "exceljs";
import { fetchValidated } from "../lib/fetch-validated.ts";
import { loadWorkbookFromBytes } from "../lib/load-workbook.ts";
import { writeValidatedJsonAtomic, markExistingFileStale } from "../lib/atomic-write.ts";
import { logIngestionError } from "../lib/log.ts";
import { cmhcBaselineSchema, type CmhcBaseline } from "../schemas/cmhc.ts";
import { CMHC_XLSX_URL, OUTPUT_DIR } from "../config.ts";

const LIVE_PATH = path.join(OUTPUT_DIR, "cmhc_baseline.json");

// CMHC's Rental Market Survey is conducted once per year, in October — do not
// expect or attempt more frequent refreshes from this source. Re-run
// `ingest:cmhc` manually each year once the new edition is published.
const CADENCE = "annual (CMHC Rental Market Survey, October)";

/**
 * CMHC HMIP data tables aren't laid out identically across geographies/editions,
 * so columns are located by matching header text rather than fixed indices.
 * NOTE: this parser has not been run against a real CMHC export in this session
 * (see config.ts for why no stable XLSX URL could be sourced) — verify column
 * matching against an actual downloaded file before relying on this in production.
 */
const HEADER_MATCHERS: Record<string, RegExp> = {
  zone: /^(zone|geography|area)/i,
  bachelor: /bachelor/i,
  oneBed: /1[\s-]*bedroom/i,
  twoBed: /2[\s-]*bedroom/i,
  threeBedPlus: /3[\s-]*bedroom/i,
  vacancy: /vacancy/i,
};

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
  const text = cellText(value).trim();
  if (!text || /^\*+$/.test(text) || /n\/?a/i.test(text)) return null; // CMHC uses "**" for suppressed cells
  const n = Number(text.replace(/[$,%]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function findHeaderRow(
  sheet: ExcelJS.Worksheet,
): { row: ExcelJS.Row; columns: Record<string, number> } | null {
  for (let r = 1; r <= Math.min(sheet.rowCount, 30); r++) {
    const row = sheet.getRow(r);
    const columns: Record<string, number> = {};
    for (let c = 1; c <= row.cellCount; c++) {
      const text = cellText(row.getCell(c).value);
      for (const [key, matcher] of Object.entries(HEADER_MATCHERS)) {
        if (matcher.test(text) && !(key in columns)) columns[key] = c;
      }
    }
    if (columns["zone"] && (columns["oneBed"] || columns["bachelor"])) {
      return { row, columns };
    }
  }
  return null;
}

export async function ingestCmhc(): Promise<void> {
  if (!CMHC_XLSX_URL) {
    const reason =
      "CMHC_XLSX_URL is not configured — see scripts/ingest/config.ts for how to obtain it";
    logIngestionError({
      source: "cmhc_baseline (CMHC)",
      endpoint: "(unconfigured)",
      timestamp: new Date().toISOString(),
      reason,
    });
    markExistingFileStale(LIVE_PATH);
    throw new Error(reason);
  }

  try {
    const { body } = await fetchValidated(CMHC_XLSX_URL, [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream",
    ]);

    const workbook = await loadWorkbookFromBytes(body);
    const sheet = workbook.worksheets[0];
    if (!sheet) throw new Error("XLSX has no worksheets");

    const header = findHeaderRow(sheet);
    if (!header) throw new Error("Could not locate a header row with zone/bedroom-type columns");
    const { row: headerRow, columns } = header;

    const zones: CmhcBaseline["zones"] = [];
    for (let r = headerRow.number + 1; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const zoneName = cellText(row.getCell(columns["zone"]!).value).trim();
      if (!zoneName) continue;

      zones.push({
        zone_name: zoneName,
        bachelor_avg_rent: columns["bachelor"]
          ? cellNumber(row.getCell(columns["bachelor"]).value)
          : null,
        one_bed_avg_rent: columns["oneBed"]
          ? cellNumber(row.getCell(columns["oneBed"]).value)
          : null,
        two_bed_avg_rent: columns["twoBed"]
          ? cellNumber(row.getCell(columns["twoBed"]).value)
          : null,
        three_bed_plus_avg_rent: columns["threeBedPlus"]
          ? cellNumber(row.getCell(columns["threeBedPlus"]).value)
          : null,
        vacancy_rate_pct: columns["vacancy"]
          ? cellNumber(row.getCell(columns["vacancy"]).value)
          : null,
      });
    }

    if (zones.length === 0) {
      throw new Error("Parsed zero zones from CMHC XLSX");
    }

    const data: CmhcBaseline = {
      data_status: "ok",
      data_level: "city",
      last_updated: new Date().toISOString(),
      cadence: CADENCE,
      source: {
        name: "CMHC Rental Market Survey",
        endpoint: CMHC_XLSX_URL,
        disclaimer:
          "CMHC Rental Market Survey results are a city/zone-level annual baseline (surveyed each October), not a neighbourhood-level or real-time figure. Suppressed cells (small sample size) are recorded as null.",
      },
      zones,
    };

    writeValidatedJsonAtomic(LIVE_PATH, data, cmhcBaselineSchema);
    console.log(`[ingest:cmhc] OK — wrote ${zones.length} zones`);
  } catch (err) {
    logIngestionError({
      source: "cmhc_baseline (CMHC)",
      endpoint: CMHC_XLSX_URL,
      timestamp: new Date().toISOString(),
      reason: err instanceof Error ? err.message : String(err),
    });
    markExistingFileStale(LIVE_PATH);
    throw err;
  }
}
