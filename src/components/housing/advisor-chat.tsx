import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Map,
  FileSearch,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFlow } from "./flow-state";
import { JOURNEY_STAGES } from "@/data/journey";
import { SAMPLE_CONVERSATIONS, type SampleConversation } from "@/data/advisor-samples";
import { cn } from "@/lib/utils";
import { Disclosure, LearnMore } from "./primitives";

type Verification = { status: "verified" | "flagged" | "unverified"; reason?: string };
type Msg = { role: "user" | "assistant"; content: string; verification?: Verification };

const VERIFY_MARKER = "\u0000\u0000VERIFY\u0000\u0000";

const STAGE_LABELS: Record<number, string> = {
  0: "browsing the immigration-stage checklist",
  1: "reading the where-to-look guide",
  2: "using the housing evaluation framework",
  3: "verifying a specific address",
  4: "using the advisor's listing & negotiation coach",
  5: "preparing their application documents",
};

const SUGGESTIONS = [
  "Can you help me find housing near my university?",
  "I have no Canadian credit — what do I offer instead?",
  "Is this deposit request legal in Ontario?",
  "Write a first message to a landlord for me.",
];

function useAdvisor() {
  const { step, journeyStage, filters } = useFlow();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setPending(true);

    const journey = JOURNEY_STAGES.find((s) => s.id === journeyStage);
    const context = `The user is ${STAGE_LABELS[step] ?? "browsing"}. Immigration stage: ${
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
      // Raw accumulator (may contain the trailing verification marker) is
      // kept separate from what's shown, so a verifier JSON blob never
      // flashes on screen as literal text even for a moment.
      let raw = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
        const markerIndex = raw.indexOf(VERIFY_MARKER);
        const displayed = markerIndex === -1 ? raw : raw.slice(0, markerIndex);
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last && last.role === "assistant") {
            copy[copy.length - 1] = { ...last, content: displayed };
          }
          return copy;
        });
      }

      const markerIndex = raw.indexOf(VERIFY_MARKER);
      if (markerIndex !== -1) {
        const tail = raw.slice(markerIndex + VERIFY_MARKER.length).trim();
        try {
          const verification = JSON.parse(tail) as Verification;
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last && last.role === "assistant") {
              copy[copy.length - 1] = { ...last, verification };
            }
            return copy;
          });
        } catch {
          // Verifier payload didn't parse — leave the answer unlabelled
          // rather than showing broken JSON or guessing a status.
        }
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

  return { messages, setMessages, pending, error, send };
}

/** The conversation surface: transcript, suggestions and composer. */
export function AdvisorConversation({ className }: { className?: string }) {
  const { advance } = useFlow();
  const { messages, setMessages, pending, error, send } = useAdvisor();
  const [input, setInput] = useState("");
  const [sample, setSample] = useState<SampleConversation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  function loadSample(s: SampleConversation) {
    setSample(s);
    setMessages(s.turns.map((t) => ({ role: t.role, content: t.content })));
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <LearnMore label="How the advisor works">
              <p className="text-sm leading-relaxed text-muted-foreground">
                The static pages hold no curated housing recommendations. The advisor asks a few
                clarifying questions before giving personalised guidance, and it has no listing
                database, so it will not invent addresses, prices or availability.
              </p>
            </LearnMore>

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
                onClick={() => advance(2)}
                className="flex items-center gap-2.5 rounded-xl border border-advisor/40 bg-advisor-soft/60 p-3 text-left text-sm font-medium text-advisor transition-colors hover:bg-advisor-soft"
              >
                <Map className="size-4 shrink-0" aria-hidden />
                How to evaluate housing options
              </button>
              <button
                type="button"
                onClick={() => advance(4)}
                className="flex items-center gap-2.5 rounded-xl border border-advisor/40 bg-advisor-soft/60 p-3 text-left text-sm font-medium text-advisor transition-colors hover:bg-advisor-soft"
              >
                <FileSearch className="size-4 shrink-0" aria-hidden />
                Read a listing & coach my reply
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

        {messages.map((m, i) => (
          <div key={i} className={cn("max-w-[85%]", m.role === "user" ? "ml-auto" : "")}>
            <div
              className={cn(
                "whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-sand text-foreground",
              )}
            >
              {m.content || "…"}
            </div>
            {m.role === "assistant" && m.verification && (
              <p
                className={cn(
                  "mt-1 flex items-center gap-1.5 px-1 text-[11px] font-medium",
                  m.verification.status === "verified" && "text-verified",
                  m.verification.status === "flagged" && "text-caution",
                  m.verification.status === "unverified" && "text-muted-foreground",
                )}
                title={m.verification.reason}
              >
                {m.verification.status === "verified" && (
                  <>
                    <ShieldCheck className="size-3" aria-hidden />
                    Checked by verifier
                  </>
                )}
                {m.verification.status === "flagged" && (
                  <>
                    <AlertTriangle className="size-3" aria-hidden />
                    Verifier flagged this —{" "}
                    {m.verification.reason ?? "double-check before relying on it"}
                  </>
                )}
                {m.verification.status === "unverified" && (
                  <>
                    <HelpCircle className="size-3" aria-hidden />
                    Not verified this time
                  </>
                )}
              </p>
            )}
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the advisor a question…"
            aria-label="Message the advisor"
            className="h-11 min-w-0 flex-1 bg-transparent px-2.5 text-sm outline-none"
          />
          <Button
            type="submit"
            size="icon"
            className="size-10 shrink-0 rounded-xl"
            disabled={pending || !input.trim()}
          >
            <Send className="size-4" aria-hidden />
            <span className="sr-only">Send</span>
          </Button>
        </div>
        <p className="mt-2 px-1 text-[11px] text-muted-foreground">
          Try: deposits, credit history, commute trade-offs, landlord messages.
        </p>
      </form>
    </div>
  );
}

export function AdvisorHeader({ onClose }: { onClose?: () => void }) {
  return (
    <header className="border-b border-advisor/25 bg-advisor-soft/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-advisor text-advisor-foreground">
            <Sparkles className="size-4.5" aria-hidden />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-advisor">
              Core capability
            </p>
            <h2 className="font-display text-lg leading-tight">Ask the AI Advisor</h2>
          </div>
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
      {/*
        Now accurate: generator (Claude) + verifier (Gemini) pipeline is
        implemented in advisor.ts. Still one caveat — see the model-string
        warning there — so this label stays a notch short of the full
        "Claude + ChatGPT + Gemini" spec until ChatGPT (generator 2) is
        added and the exact model strings are confirmed against Lovable's
        gateway.
      */}
      <p className="mt-2 text-xs text-advisor">
        AI-generated guidance, checked by a second model · not verified fact · may vary by situation
      </p>
    </header>
  );
}

/** Primary advisor surface — third column on desktop, full section on small screens. */
export function AdvisorPanel() {
  return (
    <aside
      aria-label="Ask the AI Advisor"
      className="order-first flex h-[70vh] flex-col lg:order-none overflow-hidden rounded-2xl border-2 border-advisor/35 bg-card shadow-sm lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]"
    >
      <AdvisorHeader />
      <AdvisorConversation />
    </aside>
  );
}
