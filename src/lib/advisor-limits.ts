/**
 * Cost-control limits for the AI Advisor. Shared by the client (soft guard +
 * UI feedback) and the API route (hard enforcement — the client can be bypassed).
 */
export const ADVISOR_LIMITS = {
  /** Questions one browser session may send before the composer locks. */
  maxQuestionsPerSession: 15,
  /** Characters accepted in a single question. */
  maxCharsPerMessage: 600,
  /** Prior turns resent as context on each call (smaller = cheaper). */
  historyTurns: 8,
  /**
   * Upper bound on generated tokens per answer. Reasoning models (e.g. the
   * Gemini fallback) bill invisible "thinking" tokens against this same cap,
   * not just the visible reply — too low a value hits MAX_TOKENS and truncates
   * the answer mid-sentence before the model finishes thinking. Verified against
   * gemini-3.6-flash: a moderately elaborate reply used ~580 thinking tokens
   * alone, so this needs real headroom above the visible-answer length.
   */
  maxOutputTokens: 1536,
  /** Server-side per-IP request budget. */
  ipWindowMs: 60 * 60 * 1000,
  maxRequestsPerIpPerWindow: 40,
} as const;

export function questionsUsed(messages: { role: string }[]) {
  return messages.filter((m) => m.role === "user").length;
}
