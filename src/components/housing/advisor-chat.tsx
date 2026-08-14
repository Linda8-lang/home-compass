import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlow } from "./flow-state";
import { JOURNEY_STAGES } from "@/data/journey";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const STAGE_LABELS = [
  "Stage 0 — choosing their immigration stage",
  "Stage 1 — learning where to look for housing",
  "Stage 2 — searching and comparing neighbourhoods",
  "Stage 3 — verifying a specific address",
  "Stage 4 — negotiating with a landlord",
  "Stage 5 — preparing their application documents",
];

const SUGGESTIONS = [
  "I have no Canadian credit — what do I offer instead?",
  "Is this deposit request legal in Ontario?",
  "Write a first message to a landlord for me.",
];

export function AdvisorChat() {
  const { step, journeyStage, filters } = useFlow();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;
    setError(null);
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setPending(true);

    const journey = JOURNEY_STAGES.find((s) => s.id === journeyStage);
    const context = `${STAGE_LABELS[step] ?? "browsing"}. Immigration stage: ${
      journey?.name ?? journeyStage
    }. Budget: $${filters.budget}/month in ${filters.city}. Status: ${filters.status}.`;

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "The advisor could not answer right now.");
      }

      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last && last.role === "assistant") {
            copy[copy.length - 1] = { role: "assistant", content: last.content + chunk };
          }
          return copy;
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setMessages((m) =>
        m.length && m[m.length - 1]?.role === "assistant" && !m[m.length - 1]?.content
          ? m.slice(0, -1)
          : m,
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full bg-advisor px-4 py-3 text-sm font-semibold text-advisor-foreground shadow-lg transition-transform hover:scale-[1.03]"
      >
        <Sparkles className="size-4" aria-hidden />
        Ask the advisor
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 sm:items-center sm:p-4">
          <div className="flex h-[85vh] w-full max-w-lg flex-col rounded-t-2xl border border-border bg-card shadow-xl sm:h-[70vh] sm:rounded-2xl">
            <header className="flex items-center justify-between gap-3 border-b border-border p-4">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-advisor-soft text-advisor">
                  <Sparkles className="size-4" aria-hidden />
                </span>
                <div>
                  <h2 className="text-base leading-tight">AI Advisor</h2>
                  <p className="text-xs text-muted-foreground">Guidance, not legal advice</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close advisor"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-sand"
              >
                <X className="size-4" aria-hidden />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Ask anything about renting in Toronto as a newcomer — deposits, credit
                    substitutes, scam checks, or what to say to a landlord.
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => void send(s)}
                        className="surface p-3 text-left text-sm hover:border-advisor/50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "bg-sand text-foreground",
                  )}
                >
                  {m.content || "…"}
                </div>
              ))}

              {pending && messages[messages.length - 1]?.role === "user" && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden /> Thinking…
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <form
              className="flex items-center gap-2 border-t border-border p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about deposits, credit, scams…"
                aria-label="Message the advisor"
                className="h-11 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <Button type="submit" size="icon" className="size-11 shrink-0" disabled={pending || !input.trim()}>
                <Send className="size-4" aria-hidden />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
