import { durationResources, type HousingResource } from "@/data/housing-sections";

/**
 * Deterministic "where to look" navigation for the Advisor, sourced from Find Housing's
 * duration cards (src/data/housing-sections.ts) — the data isn't duplicated here. This is
 * a distinct mechanism from the citation registry in advisor-context.ts: a resource pointer
 * is navigation, not a sourced fact, and the model never selects or ranks entries itself —
 * which ones appear, in what order, capped at how many, is all decided here in code.
 */

export type ResourcePointer = HousingResource & {
  tier: "temporary" | "short-term" | "long-term";
};

const TIER_KEYWORDS: Record<ResourcePointer["tier"], string[]> = {
  temporary: ["temporary", "days", "weeks", "settle in", "short stay", "immediate"],
  "short-term": ["short-term", "short term", "sublet", "few months", "1-6 months"],
  "long-term": ["long-term", "long term", "lease", "permanent", "6+ months"],
};

/** Deterministic keyword match against the user's latest message. No LLM call. */
export function matchDurationTier(question: string): ResourcePointer["tier"] | null {
  const q = question.toLowerCase();
  for (const tier of ["temporary", "short-term", "long-term"] as const) {
    if (TIER_KEYWORDS[tier].some((k) => q.includes(k))) return tier;
  }
  return null;
}

/** Returns at most `max` resources for the matched duration tier, in their original order. */
export function getResourcePointers(question: string, max = 4): ResourcePointer[] {
  const tier = matchDurationTier(question);
  if (!tier) return [];

  const bucket = durationResources.find((d) => d.id === tier);
  if (!bucket) return [];

  return bucket.resources.slice(0, max).map((resource) => ({ ...resource, tier }));
}
