import fs from "node:fs";
import { LOG_DIR, LOG_FILE } from "../config.ts";

export type IngestionErrorEntry = {
  source: string;
  endpoint: string;
  timestamp: string;
  reason: string;
};

export function logIngestionError(entry: IngestionErrorEntry): void {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  fs.appendFileSync(LOG_FILE, `${JSON.stringify(entry)}\n`, "utf8");
  console.error(`[ingest:${entry.source}] FAILED — ${entry.reason} (${entry.endpoint})`);
}
