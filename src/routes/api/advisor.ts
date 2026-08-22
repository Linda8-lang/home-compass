import { createFileRoute } from "@tanstack/react-router";
import { ADVISOR_LIMITS, questionsUsed } from "@/lib/advisor-limits";

/**
 * In-memory per-IP budget. Best-effort only (resets on redeploy / per worker
 * instance), but it stops a single client from burning credits in a loop.
 */
const ipHits = new Map<string, number[]>();

function overIpBudget(ip: string) {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < ADVISOR_LIMITS.ipWindowMs);
  hits.push(now);
  ipHits.set(ip, hits);
  if (ipHits.size > 5000) ipHits.clear();
  return hits.length > ADVISOR_LIMITS.maxRequestsPerIpPerWindow;
}

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are the AI Advisor inside "Housing Assistant", a prototype that helps newcomers find and secure housing in Toronto, Canada.

Rules:
- Be concise and practical. Short paragraphs or tight bullet lists. No headings, no emoji.
- Answer for Toronto/Ontario specifically: first + last month's rent is the legal maximum deposit, damage deposits are not allowed, key deposits are refundable, rent increases follow the annual guideline with 90 days notice.
- The user is a newcomer with no Canadian credit history. Suggest concrete substitutes: proof of funds, guarantor, employment or admission letter, translated references.
- Flag scam patterns whenever money is discussed before an in-person or live-video viewing.
- Any number you cite is general guidance, not a verified figure. The app's own listings, rents and safety scores are sample data — say so if asked.
- Never invent specific addresses, landlords, listings, availability or prices. You have no listing database. If asked to find a place, say you cannot show listings and instead help the user work out what to look for and where to look.
- You are helping the user explore and evaluate information. You do not present recommendations curated by the product team, and the app's static pages contain no curated housing recommendations.

Clarifying-question protocol (important):
- Before giving personalised housing guidance, make sure you know enough. The inputs that matter are: destination city or area, work or school location, approximate budget, preferred housing type, acceptable commute time, temporary vs. long-term, and other hard constraints (household size, pets, accessibility, move-in date).
- Ask only the minimum needed to answer usefully. Never dump the whole list. Ask at most three short questions in your first reply, then one at a time.
- Never re-ask something the user already told you or that the app context already provides. Briefly reflect back what you have before asking the next thing.
- Stop asking as soon as you can give a useful answer, and say so. If the user will not answer, give general guidance with the assumptions stated.
- For questions that are not situation-specific (legal rules, deposits, scam signals, documents), answer directly with no clarifying questions.`;

/** Turns an upstream SSE byte stream into a plain-text stream of answer deltas. */
function toPlainTextStream(
  upstreamBody: ReadableStream<Uint8Array>,
  extractDelta: (json: any) => string | null,
) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === "[DONE]") continue;
        try {
          const delta = extractDelta(JSON.parse(data));
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          // partial JSON — ignore
        }
      }
    },
  });
  return upstreamBody.pipeThrough(transform);
}

function errorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Primary provider: the Lovable AI Gateway (OpenAI-compatible chat completions). */
async function callLovable(apiKey: string, history: Msg[], systemLines: string[]) {
  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      stream: true,
      max_tokens: ADVISOR_LIMITS.maxOutputTokens,
      messages: [...systemLines.map((content) => ({ role: "system", content })), ...history],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error("advisor upstream error (lovable)", upstream.status, detail.slice(0, 500));
    const message =
      upstream.status === 429
        ? "The advisor is rate limited right now — try again in a moment."
        : upstream.status === 402
          ? "AI credits are exhausted for this workspace."
          : `The advisor could not answer (${upstream.status}).`;
    return errorResponse(message, upstream.status);
  }

  const stream = toPlainTextStream(upstream.body, (json) => {
    const delta = json?.choices?.[0]?.delta?.content;
    return typeof delta === "string" && delta.length > 0 ? delta : null;
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}

/**
 * Fallback provider: calls the Gemini API directly, used only when LOVABLE_API_KEY
 * is not configured. Gemini's native format differs from OpenAI's — roles are
 * "user"/"model" (not "assistant"), and the system prompt is a separate field.
 */
async function callGeminiDirect(apiKey: string, history: Msg[], systemLines: string[]) {
  // Configurable because Google periodically retires model names (e.g. gemini-2.5-flash
  // returning 404 "no longer available to new users") — override via GEMINI_MODEL instead
  // of hardcoding a name that can silently break again later.
  const model = process.env["GEMINI_MODEL"] || "gemini-2.0-flash";
  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemLines.join("\n\n") }] },
        generationConfig: { maxOutputTokens: ADVISOR_LIMITS.maxOutputTokens },
        contents: history.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      }),
    },
  );

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error(
      "advisor upstream error (gemini fallback)",
      upstream.status,
      detail.slice(0, 500),
    );
    const message =
      upstream.status === 429
        ? "The advisor is rate limited right now — try again in a moment."
        : upstream.status === 404
          ? "The configured AI model is unavailable — set GEMINI_MODEL to a current model name."
          : upstream.status === 400 || upstream.status === 403
            ? "AI is not configured correctly."
            : `The advisor could not answer (${upstream.status}).`;
    return errorResponse(message, upstream.status);
  }

  const stream = toPlainTextStream(upstream.body, (json) => {
    const delta = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof delta === "string" && delta.length > 0 ? delta : null;
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}

export const Route = createFileRoute("/api/advisor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const lovableKey = process.env["LOVABLE_API_KEY"];
        const geminiKey = process.env["homecompass"];
        if (!lovableKey && !geminiKey) {
          return errorResponse("AI is not configured.", 500);
        }

        let body: { messages?: Msg[]; context?: string };
        try {
          body = (await request.json()) as { messages?: Msg[]; context?: string };
        } catch {
          return errorResponse("Invalid request.", 400);
        }

        const all = (body.messages ?? []).filter((m) => typeof m.content === "string");
        if (all.length === 0) {
          return errorResponse("No message provided.", 400);
        }

        // Hard caps — the client shows these limits, but never trust it.
        if (questionsUsed(all) > ADVISOR_LIMITS.maxQuestionsPerSession) {
          return errorResponse(
            `You have reached this session's limit of ${ADVISOR_LIMITS.maxQuestionsPerSession} questions. Start a new conversation to continue.`,
            429,
          );
        }
        const latest = all[all.length - 1];
        if ((latest?.content.length ?? 0) > ADVISOR_LIMITS.maxCharsPerMessage) {
          return errorResponse(
            `Questions are limited to ${ADVISOR_LIMITS.maxCharsPerMessage} characters.`,
            400,
          );
        }
        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        if (overIpBudget(ip)) {
          return errorResponse("Hourly usage limit reached — please try again later.", 429);
        }

        const history = all.slice(-ADVISOR_LIMITS.historyTurns);

        const systemLines = [
          SYSTEM,
          ...(body.context ? [`Where the user is in the app: ${body.context}`] : []),
        ];

        // LOVABLE_API_KEY is the primary path; homecompass only kicks in when it's absent.
        if (lovableKey) return callLovable(lovableKey, history, systemLines);
        return callGeminiDirect(geminiKey!, history, systemLines);
      },
    },
  },
});
