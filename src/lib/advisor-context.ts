import { CITATIONS, SOURCES } from "@/data/sources";

/**
 * The one deliberate exception to the two-lane boundary (see CLAUDE.md): this reads only
 * the small, human-authored citation registry in src/data/sources.ts — never
 * src/data/generated/* (ingested crime/rent data), which stays static-lane-only.
 */

/**
 * type: "curated" entries are sourced facts from the CITATIONS registry (this file).
 * type: "resource" entries are the resource-directory pointers built in
 * advisor-resources.ts — a distinct, navigation-only mechanism that happens to share
 * this shape so the client can render both from one X-Advisor-Sources header.
 */
export type VerifiedEntry = {
  label: string;
  sourceName: string;
  updated: string;
  text?: string;
  type: "curated" | "resource";
  url?: string;
};

/** Keyword sets for deterministic matching — no LLM call, no fuzzy scoring. */
const KEYWORDS: Record<string, string[]> = {
  depositRules: [
    "deposit",
    "first and last",
    "damage deposit",
    "key deposit",
    "last month's rent",
    "last month rent",
  ],
  tenancyRights: [
    "entry notice",
    "notice to enter",
    "repair",
    "eviction",
    "evict",
    "tenancy right",
    "tenant right",
    "landlord enter",
  ],
  rentIncreaseNotice: [
    "rent increase",
    "raise the rent",
    "raise my rent",
    "90 days",
    "guideline increase",
    "increase notice",
  ],
  discriminationProtections: [
    "discriminat",
    "human rights",
    "refused my application",
    "denied my application",
    "won't rent to me",
    "turned down",
    "protected ground",
  ],
};

/** Deterministic keyword match against the citation registry. No LLM call. */
export function retrieveVerifiedContext(question: string): VerifiedEntry[] {
  const q = question.toLowerCase();
  const entries: VerifiedEntry[] = [];

  for (const [id, citation] of Object.entries(CITATIONS)) {
    const keywords = KEYWORDS[id] ?? [];
    if (!keywords.some((k) => q.includes(k))) continue;

    const source = SOURCES[citation.sourceIds[0]];
    if (!source) continue;

    // Multiple sources can back one citation (see depositRules); use the first that has a url.
    const url = citation.sourceIds
      .map((sourceId) => SOURCES[sourceId]?.url)
      .find((u): u is string => !!u);

    entries.push({
      label: citation.label,
      sourceName: source.name,
      updated: source.updated,
      text: citation.note,
      type: "curated",
      url,
    });
  }

  return entries;
}

/** Renders matched entries as a labelled block the system prompt can instruct the model to cite. */
export function formatVerifiedContext(entries: VerifiedEntry[]): string | null {
  if (entries.length === 0) return null;

  const lines = entries.map(
    (e) => `- ${e.label} — ${e.sourceName}, updated ${e.updated}: ${e.text}`,
  );

  return [
    "Verified data (cite each fact you use here by source name and date; never state anything from this block without that attribution):",
    ...lines,
  ].join("\n");
}
