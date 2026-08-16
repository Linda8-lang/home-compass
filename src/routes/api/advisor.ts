import { createFileRoute } from "@tanstack/react-router";

/**
 * Generator + verifier pipeline, per the "Full pipeline" spec (Housing is
 * one of the categories that gets this):
 *   generator 1: Claude
 *   generator 2: ChatGPT (explicitly "add later" in the spec — not built here)
 *   verifier: Gemini — checks the answer is real, on-topic, and current
 *   citations enforced
 *
 * MODEL STRING WARNING: GENERATOR_MODEL below is a best-guess Anthropic
 * model identifier in the "provider/model" format this gateway already
 * uses for Gemini. I could not verify it against Lovable AI Gateway's
 * actual supported-model list from this environment (no LOVABLE_API_KEY,
 * no network access to the gateway to introspect it). Before this ships,
 * confirm the exact string in the Lovable dashboard's model picker or
 * gateway docs and update GENERATOR_MODEL — don't assume this is correct
 * just because it compiles.
 *
 * STREAMING + VERIFICATION TRADE-OFF: the generator's answer streams to
 * the client token-by-token as before, so the UX doesn't get slower. The
 * verifier call happens server-side *after* the full generator answer is
 * known, and its result is appended to the stream as a trailing marker
 * (see VERIFY_MARKER below) rather than gating the stream — a failed or
 * flagged verification does not un-send text already shown to the user.
 * advisor-chat.tsx parses that marker out and renders it as a badge. This
 * was a deliberate choice over buffering the whole answer before sending
 * anything (which would remove the live-typing UX) — flag if the product
 * decision should go the other way.
 */

const GENERATOR_MODEL = process.env["ADVISOR_GENERATOR_MODEL"] || "anthropic/claude-sonnet-4-5";
const VERIFIER_MODEL = process.env["ADVISOR_VERIFIER_MODEL"] || "google/gemini-2.5-flash";

// Unlikely-to-collide marker the client strips before rendering. Emitted
// once, at the very end of the stream, after all generator content.
const VERIFY_MARKER = "\u0000\u0000VERIFY\u0000\u0000";

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

const VERIFIER_SYSTEM = `You check one AI-generated answer for a housing-assistant app. Reply with EXACTLY one line of JSON, nothing else, no markdown fences:
{"status":"verified"|"flagged","reason":"<short reason, omit if verified>"}

Flag if: the answer states specific real-world facts (prices, legal rules, addresses) that read as fabricated or outdated rather than general guidance; the answer contradicts Ontario tenancy rules; the answer presents a claim as fact without it reading as sourced or clearly labeled as general guidance.
Do not flag general, appropriately-hedged guidance. Do not flag the answer just for being brief.`;

async function runVerifier(
  apiKey: string,
  answerText: string,
): Promise<{ status: string; reason?: string }> {
  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: VERIFIER_MODEL,
        stream: false,
        messages: [
          { role: "system", content: VERIFIER_SYSTEM },
          { role: "user", content: answerText },
        ],
      }),
    });
    if (!res.ok) return { status: "unverified", reason: "Verifier call failed." };
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json?.choices?.[0]?.message?.content?.trim() ?? "";
    const parsed = JSON.parse(raw) as { status?: string; reason?: string };
    if (parsed.status === "verified" || parsed.status === "flagged") {
      return parsed.reason
        ? { status: parsed.status, reason: parsed.reason }
        : { status: parsed.status };
    }
    return { status: "unverified" };
  } catch {
    // Verifier failures should never break the user-facing answer — the
    // generator's text has already streamed successfully at this point.
    return { status: "unverified", reason: "Verifier could not run." };
  }
}

export const Route = createFileRoute("/api/advisor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "AI is not configured." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: { messages?: Msg[]; context?: string };
        try {
          body = (await request.json()) as { messages?: Msg[]; context?: string };
        } catch {
          return new Response(JSON.stringify({ error: "Invalid request." }), { status: 400 });
        }

        const history = (body.messages ?? [])
          .slice(-12)
          .filter((m) => typeof m.content === "string");
        if (history.length === 0) {
          return new Response(JSON.stringify({ error: "No message provided." }), { status: 400 });
        }

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: GENERATOR_MODEL,
            stream: true,
            messages: [
              { role: "system", content: SYSTEM },
              ...(body.context
                ? [{ role: "system", content: `Where the user is in the app: ${body.context}` }]
                : []),
              ...history,
            ],
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          const message =
            upstream.status === 429
              ? "The advisor is rate limited right now — try again in a moment."
              : upstream.status === 402
                ? "AI credits are exhausted for this workspace."
                : `The advisor could not answer (${upstream.status}).`;
          console.error("advisor upstream error", upstream.status, detail.slice(0, 500));
          return new Response(JSON.stringify({ error: message }), {
            status: upstream.status,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Re-emit the upstream SSE as a plain text stream of answer deltas,
        // while also collecting the full text so the verifier can run once
        // the generator is done.
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";
        let fullAnswer = "";
        const stream = new TransformStream<Uint8Array, Uint8Array>({
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
                const json = JSON.parse(data);
                const delta = json?.choices?.[0]?.delta?.content;
                if (typeof delta === "string" && delta.length > 0) {
                  fullAnswer += delta;
                  controller.enqueue(encoder.encode(delta));
                }
              } catch {
                // partial JSON — ignore
              }
            }
          },
          async flush(controller) {
            if (fullAnswer.trim().length === 0) return;
            const result = await runVerifier(apiKey, fullAnswer);
            controller.enqueue(encoder.encode(VERIFY_MARKER + JSON.stringify(result)));
          },
        });

        return new Response(upstream.body.pipeThrough(stream), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
