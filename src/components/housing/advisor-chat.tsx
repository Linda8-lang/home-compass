import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Loader2, Map, ShieldCheck, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlow } from "./flow-state";
import { JOURNEY_STAGES } from "@/data/journey";
import { SAMPLE_CONVERSATIONS, type SampleConversation } from "@/data/advisor-samples";
import { cn } from "@/lib/utils";
import { Disclosure, LearnMore, DisclaimerBadge } from "./primitives";
import { ADVISOR_LIMITS, questionsUsed } from "@/lib/advisor-limits";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Can you help me find housing near my university?",
  "I have no Canadian credit — what do I offer instead?",
  "Is this deposit request legal in Ontario?",
  "Write a first message to a landlord for me.",
];

function useAdvisor() {
  const { journeyStage, filters, advisorAppContext } = useFlow();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const used = questionsUsed(messages);
  const remaining = Math.max(0, ADVISOR_LIMITS.maxQuestionsPerSession - used);

  function reset() {
    setMessages([]);
    setError(null);
  }

  async function send(text: string) {
    const content = text.trim().slice(0, ADVISOR_LIMITS.maxCharsPerMessage);
    if (!content || pending) return;
    if (remaining === 0) {
      setError(
        `You have used all ${ADVISOR_LIMITS.maxQuestionsPerSession} questions for this conversation. Start a new one to continue.`,
      );
      return;
    }
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setPending(true);

    const journey = JOURNEY_STAGES.find((s) => s.id === journeyStage);
    const baseContext = `Immigration stage: ${journey?.name ?? journeyStage}. Budget: $${filters.budget}/month in ${filters.city}. Status: ${filters.status}.`;
    // advisorAppContext summarizes the user's own interactions in the static lane
    // (reviewed criteria, their own cost inputs, selected housing type) — read-only
    // from here, never written back into that state. It deliberately excludes
    // Check the Place / any curated or ingested data; that boundary is unchanged.
    const context = advisorAppContext ? `${baseContext} ${advisorAppContext}` : baseContext;

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

  return { messages, setMessages, pending, error, send, remaining, used, reset };
}

function scrollToSection(anchor: string) {
  if (typeof document === "undefined") return;
  document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** The conversation surface: transcript, suggestions and composer. */
export function AdvisorConversation({ className }: { className?: string }) {
  const { advisorPrompt, clearAdvisorPrompt } = useFlow();
  const { messages, setMessages, pending, error, send, remaining, reset } = useAdvisor();
  const [input, setInput] = useState("");
  const [sample, setSample] = useState<SampleConversation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  // Column 2's "Ask the AI Advisor about this" hands a question over here — a
  // one-way read, never a write back into Column 2's own data or state.
  useEffect(() => {
    if (!advisorPrompt) return;
    setInput(advisorPrompt);
    inputRef.current?.focus();
    clearAdvisorPrompt();
  }, [advisorPrompt, clearAdvisorPrompt]);

  function loadSample(s: SampleConversation) {
    setSample(s);
    setMessages(s.turns.map((t) => ({ role: t.role, content: t.content })));
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Personalised guidance happens here.
              </p>
              <LearnMore label="How the advisor works">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  The static pages hold no curated housing recommendations. The advisor asks a few
                  clarifying questions before giving personalised guidance, and it has no listing
                  database, so it will not invent addresses, prices or availability.
                </p>
              </LearnMore>
            </div>

            <div className="rounded-xl border border-advisor/30 bg-advisor-soft/40 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-advisor">
                Example interaction
              </p>
              <p className="text-sm leading-relaxed text-secondary-foreground">
                <span className="font-semibold">You: </span>
                “Can you help me find housing near my university?”
              </p>
              <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">
                <span className="font-semibold">AI Advisor: </span>
                “Sure. To narrow this down, what is your university, preferred monthly budget, and
                maximum commute time?”
              </p>
              <button
                type="button"
                onClick={() => void send("Can you help me find housing near my university?")}
                className="mt-3 text-xs font-semibold text-advisor underline underline-offset-2"
              >
                Try this conversation
              </button>
            </div>

            <Disclosure
              title="Sample conversation states"
              summary={`${SAMPLE_CONVERSATIONS.length} realistic starting points`}
              moreLabel="Show"
            >
              {SAMPLE_CONVERSATIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => loadSample(s)}
                  className="surface w-full p-3 text-left hover:border-advisor/50"
                >
                  <span className="block text-sm font-medium">{s.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{s.blurb}</span>
                </button>
              ))}
            </Disclosure>

            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => scrollToSection("compare-housing")}
                className="flex items-center gap-2.5 rounded-xl border border-advisor/40 bg-advisor-soft/60 p-3 text-left text-sm font-medium text-advisor transition-colors hover:bg-advisor-soft"
              >
                <Map className="size-4 shrink-0" aria-hidden />
                How to evaluate housing options
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("verify-the-place")}
                className="flex items-center gap-2.5 rounded-xl border border-advisor/40 bg-advisor-soft/60 p-3 text-left text-sm font-medium text-advisor transition-colors hover:bg-advisor-soft"
              >
                <ShieldCheck className="size-4 shrink-0" aria-hidden />
                Verify a place before you commit
              </button>
            </div>

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

        {sample && messages.length > 0 && (
          <div className="rounded-xl border border-dashed border-advisor/40 bg-advisor-soft/25 p-3 text-xs">
            <p className="font-semibold text-advisor">Sample conversation · {sample.label}</p>
            <p className="mt-1 text-muted-foreground">
              {sample.stillMissing.length > 0
                ? `Still to clarify: ${sample.stillMissing.join(", ")}. Keep typing to continue this conversation.`
                : "Enough was known up front, so the advisor answered without extra questions."}
            </p>
            <button
              type="button"
              onClick={() => {
                setSample(null);
                setMessages([]);
              }}
              className="mt-2 font-semibold text-advisor underline underline-offset-2"
            >
              Clear and start fresh
            </button>
          </div>
        )}

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div
              key={i}
              className="ml-auto max-w-[85%] whitespace-pre-wrap rounded-2xl bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground"
            >
              {m.content}
            </div>
          ) : (
            // AI-generated content: visually and structurally distinct from Column 2's
            // static-content styling (different border/background treatment, not just a label).
            <div key={i} className="max-w-[85%] space-y-1">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-advisor">
                <Sparkles className="size-3" aria-hidden />
                AI-generated
              </p>
              <div className="whitespace-pre-wrap rounded-2xl border border-advisor/30 bg-advisor-soft/60 px-3.5 py-2.5 text-sm leading-relaxed text-foreground">
                {m.content || "…"}
              </div>
            </div>
          ),
        )}

        {pending && messages[messages.length - 1]?.role === "user" && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden /> Thinking…
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <form
        className="border-t border-advisor/25 bg-advisor-soft/30 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const v = input;
          setInput("");
          void send(v);
        }}
      >
        <div className="flex items-center gap-2 rounded-2xl border-2 border-advisor/40 bg-background p-1.5 focus-within:border-advisor">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, ADVISOR_LIMITS.maxCharsPerMessage))}
            maxLength={ADVISOR_LIMITS.maxCharsPerMessage}
            disabled={remaining === 0}
            placeholder={
              remaining === 0 ? "Question limit reached for this conversation" : "Ask the advisor a question…"
            }
            aria-label="Message the advisor"
            className="h-11 min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none"
          />
          <Button
            type="submit"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            disabled={pending || !input.trim() || remaining === 0}
          >
            <Send className="size-4" aria-hidden />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
          <span>
            {remaining === 0
              ? "Question limit reached."
              : `${remaining} of ${ADVISOR_LIMITS.maxQuestionsPerSession} questions left in this conversation.`}
          </span>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 rounded-md px-1.5 py-0.5 font-medium text-advisor underline-offset-2 hover:underline"
          >
            New conversation
          </button>
        </div>
      </form>
    </div>
  );
}

export function AdvisorHeader({ onClose }: { onClose?: () => void }) {
  return (
    <header className="space-y-3 border-b border-advisor/25 bg-advisor-soft/50 p-4">
      <DisclaimerBadge />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-advisor text-advisor-foreground">
            <Sparkles className="size-4.5" aria-hidden />
          </span>
          <h2 className="sr-only">AI Advisor</h2>
          <p className="flex items-center gap-1.5 text-xs font-semibold leading-snug text-advisor">
            <Cpu className="size-3.5 shrink-0" aria-hidden />
            AI-Generated Guidance | Multi-model engine (Claude + ChatGPT + Gemini) · URL-verified ·
            Citation enforced
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close advisor"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-sand"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
    </header>
  );
}

/**
 * Column 3 — AI Advisor. Docked as a persistent right-hand column: never a
 * minimizable/collapsible bottom bubble, and never expands to take over the
 * full screen. The chatbot lives entirely inside this column.
 */
export function AdvisorPanel() {
  return (
    <aside
      aria-label="AI Advisor"
      className="order-first flex h-[70vh] flex-col overflow-hidden rounded-2xl border-2 border-advisor/35 bg-card shadow-sm lg:order-none lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]"
    >
      <AdvisorHeader />
      <AdvisorConversation />
    </aside>
  );
}
