import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };

const SYSTEM = `You are the AI Advisor inside "Housing Assistant", a prototype that helps newcomers find and secure housing in Toronto, Canada.

Rules:
- Be concise and practical. Short paragraphs or tight bullet lists. No headings, no emoji.
- Answer for Toronto/Ontario specifically: first + last month's rent is the legal maximum deposit, damage deposits are not allowed, key deposits are refundable, rent increases follow the annual guideline with 90 days notice.
- The user is a newcomer with no Canadian credit history. Suggest concrete substitutes: proof of funds, guarantor, employment or admission letter, translated references.
- Flag scam patterns whenever money is discussed before an in-person or live-video viewing.
- Any number you cite is general guidance, not a verified figure. The app's own listings, rents and safety scores are sample data — say so if asked.
- Never invent specific addresses, landlords, listings, availability or prices. You have no listing database. If asked to find a place, say you cannot show listings and instead help the user work out what to look for and where to look.
- When a request is broad (for example "help me find housing near my university"), ask for the missing inputs first — university or workplace, monthly budget, maximum commute time, move-in date, household size — then explain how to weigh the trade-offs.
- You are helping the user explore and evaluate information. You do not present recommendations curated by the product team, and the app's static pages contain no curated housing recommendations.`;

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

        const history = (body.messages ?? []).slice(-12).filter((m) => typeof m.content === "string");
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
            model: "google/gemini-2.5-flash",
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

        // Re-emit the upstream SSE as a plain text stream of answer deltas.
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";
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
                  controller.enqueue(encoder.encode(delta));
                }
              } catch {
                // partial JSON — ignore
              }
            }
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
