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
  /** Upper bound on generated tokens per answer. */
  maxOutputTokens: 700,
  /** Server-side per-IP request budget. */
  ipWindowMs: 60 * 60 * 1000,
  maxRequestsPerIpPerWindow: 40,
} as const;

export function questionsUsed(messages: { role: string }[]) {
  return messages.filter((m) => m.role === "user").length;
}
