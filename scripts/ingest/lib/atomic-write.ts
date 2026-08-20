import fs from "node:fs";
import path from "node:path";
import type { ZodType } from "zod";

/**
 * Validates `data` against `schema`, then writes it to a temp path and renames
 * (atomic on the same filesystem) it onto `livePath`. The live file is never
 * touched unless validation passes in full — a failed/partial fetch can never
 * overwrite a known-good file with broken or empty data.
 */
export function writeValidatedJsonAtomic<T>(
  livePath: string,
  data: unknown,
  schema: ZodType<T>,
): T {
  const validated = schema.parse(data);
  fs.mkdirSync(path.dirname(livePath), { recursive: true });
  const tmpPath = `${livePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmpPath, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  fs.renameSync(tmpPath, livePath);
  return validated;
}

/**
 * On ingestion failure, flips a still-live file's data_status to "stale" in
 * place — without touching last_updated or any of its data — so the app can
 * tell users the served data may be outdated. No-op if there is no prior file,
 * or if it's already flagged stale/fallback_city_level.
 */
export function markExistingFileStale(livePath: string): void {
  if (!fs.existsSync(livePath)) return;
  const raw = JSON.parse(fs.readFileSync(livePath, "utf8")) as { data_status?: string };
  if (raw.data_status !== "ok") return;
  raw.data_status = "stale";
  fs.writeFileSync(livePath, `${JSON.stringify(raw, null, 2)}\n`, "utf8");
}
