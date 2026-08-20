import { ingestSafety } from "./sources/safety-tps.ts";
import { ingestRent } from "./sources/rent-ckan.ts";
import { ingestCmhc } from "./sources/rent-cmhc.ts";

const INGESTERS = {
  safety: ingestSafety,
  rent: ingestRent,
  cmhc: ingestCmhc,
} as const;

type Target = keyof typeof INGESTERS;

function parseTargets(argv: string[]): Target[] {
  const arg = argv[0] ?? "all";
  if (arg === "all") return Object.keys(INGESTERS) as Target[];
  if (arg in INGESTERS) return [arg as Target];
  console.error(
    `Unknown ingest target "${arg}". Expected one of: all, ${Object.keys(INGESTERS).join(", ")}`,
  );
  process.exit(1);
}

async function main(): Promise<void> {
  const targets = parseTargets(process.argv.slice(2));
  const results: { target: Target; ok: boolean }[] = [];

  for (const target of targets) {
    try {
      await INGESTERS[target]();
      results.push({ target, ok: true });
    } catch {
      // Individual ingesters already log structured errors and preserve the
      // last-known-good file — a failure here just means "don't promote".
      results.push({ target, ok: false });
    }
  }

  console.log("\n--- ingestion summary ---");
  for (const { target, ok } of results) {
    console.log(`${ok ? "OK  " : "FAIL"}  ${target}`);
  }

  if (results.some((r) => !r.ok)) {
    process.exitCode = 1;
  }
}

main();
