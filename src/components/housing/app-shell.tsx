import { useEffect, useState } from "react";
import { Home, BookOpen, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlow } from "./flow-state";
import { StageZero } from "./stage-zero";
import { StageOne } from "./stage-one";
import { StageTwo } from "./stage-two";
import { StageThree } from "./stage-three";
import { StageFour } from "./stage-four";
import { StageFive } from "./stage-five";
import { AdvisorPanel } from "./advisor-chat";
import { StaticDisclaimer } from "./primitives";

/** Static reference sections — browsable, factual, no dynamic recommendations. */
const SECTIONS = [
  { step: 0, label: "How to evaluate housing options", hint: "Dimensions and trade-offs" },
  { step: 1, label: "Where to look", hint: "Categories and scams" },
  { step: 3, label: "Verify an address", hint: "Local crime reports & nearby market rents" },
  { step: 5, label: "Application & communication", hint: "Documents, deposits, landlord messages" },
] as const;

const STATIC_STEPS = SECTIONS.map((s) => s.step) as readonly number[];

/** Advisor-only, interactive tools — this is where recommendations live. */
const TOOL_TITLES: Record<number, string> = {
  2: "How to evaluate housing options",
  4: "Advisor · Listing & negotiation coach",
};

export function AppShell() {
  const { step, goTo } = useFlow();
  const [lastStatic, setLastStatic] = useState(0);

  useEffect(() => {
    if (STATIC_STEPS.includes(step)) setLastStatic(step);
  }, [step]);

  const tool = step === 2 || step === 4 ? step : null;
  const contentStep = tool ? lastStatic : step;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 h-14 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-full w-full max-w-[1400px] items-center gap-3 px-4">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="size-4" aria-hidden />
          </span>
          <span className="font-display text-sm font-semibold">Housing Assistant</span>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
            Reference guide · AI Advisor
          </span>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[210px_minmax(0,1fr)_380px] lg:items-start">
        {/* 1 — Index / navigation */}
        <nav aria-label="Reference index" className="lg:sticky lg:top-20">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <BookOpen className="size-3.5" aria-hidden />
            Reference index
          </p>
          <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {SECTIONS.map((s, i) => {
              const active = contentStep === s.step && !tool;
              return (
                <li key={s.step} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => goTo(s.step)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 text-left transition-colors",
                      active
                        ? "border-primary bg-sand"
                        : "border-transparent hover:border-border hover:bg-sand/60",
                    )}
                  >
                    <span className="block text-sm font-medium text-foreground">
                      <span className="text-muted-foreground">{i + 1}. </span>
                      {s.label}
                    </span>
                    <span className="hidden text-xs text-muted-foreground lg:block">{s.hint}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <details className="mt-3 hidden rounded-xl bg-sand p-3 lg:block">
            <summary className="cursor-pointer text-xs font-medium text-secondary-foreground">
              About this section
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-secondary-foreground">
              These pages are static reference material. Anything that recommends a place to live
              lives in the AI Advisor.
            </p>
          </details>
        </nav>

        {/* 2 — Static / structured information */}
        <main className="min-w-0">
          {contentStep === 0 && <StageZero />}
          {contentStep === 1 && <StageOne />}
          {contentStep === 3 && <StageThree />}
          {contentStep === 5 && <StageFive />}
          <div className="mt-12 space-y-2 border-t border-border pt-4">
            <StaticDisclaimer />
            <p className="text-xs text-muted-foreground">
              Prototype — all listings, scores and reports are sample data.
            </p>
          </div>
        </main>

        {/* 3 — AI Advisor */}
        <AdvisorPanel />
      </div>

      {tool !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-0 sm:p-6">
          <div className="w-full max-w-3xl overflow-hidden rounded-none border-2 border-advisor/35 bg-card shadow-xl sm:rounded-2xl">
            <header className="sticky top-0 flex items-center justify-between gap-3 border-b border-advisor/25 bg-advisor-soft/70 px-4 py-3 backdrop-blur">
              <p className="flex items-center gap-2 text-sm font-semibold text-advisor">
                <Sparkles className="size-4" aria-hidden />
                {TOOL_TITLES[tool]}
              </p>
              <button
                type="button"
                onClick={() => goTo(lastStatic)}
                aria-label="Close advisor tool"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-sand"
              >
                <X className="size-4" aria-hidden />
              </button>
            </header>
            <div className="p-4 sm:p-6">
              {tool === 2 && <StageTwo />}
              {tool === 4 && <StageFour />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
