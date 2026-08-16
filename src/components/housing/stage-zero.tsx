import { ArrowRight, Plane, Luggage, Home, Info, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JOURNEY_STAGES, type JourneyStageId } from "@/data/journey";
import { HOUSING_CONSIDERATIONS } from "@/data/housing-considerations";
import { useFlow } from "./flow-state";
import {
  StageHeader,
  VariesNote,
  SourcePending,
  GuidanceBadge,
  EvidenceLegend,
  GuidanceDisclaimer,
  Disclosure,
  LearnMore,
} from "./primitives";
import { cn } from "@/lib/utils";


const icons: Record<JourneyStageId, typeof Plane> = {
  "pre-landing": Plane,
  "just-landed": Luggage,
  settling: Home,
};

export function StageZero() {
  const { advance, journeyStage, setJourneyStage } = useFlow();
  const stage = JOURNEY_STAGES.find((s) => s.id === journeyStage) ?? JOURNEY_STAGES[0]!;


  return (
    <div className="space-y-6">
      <StageHeader
        eyebrow="Stage 0 · Your immigration stage"
        title="Where are you in the move?"
        intro="Pick your stage — the guidance below adapts to it."
      />

      {/* Primary question for this screen */}
      <section className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {JOURNEY_STAGES.map((s) => {
            const Icon = icons[s.id];
            const active = s.id === stage.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setJourneyStage(s.id)}
                aria-pressed={active}
                className={cn(
                  "surface flex flex-col gap-2 p-4 text-left transition-colors",
                  active ? "border-primary ring-2 ring-primary/25" : "hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    active ? "bg-primary text-primary-foreground" : "bg-sand text-secondary-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <h3 className="text-base leading-snug">{s.name}</h3>
                <p className="text-xs text-muted-foreground">{s.window}</p>
              </button>
            );
          })}
        </div>
        <p className="flex gap-2 rounded-lg bg-caution-soft p-3 text-sm leading-relaxed text-caution">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          {stage.headsUp}
        </p>
        <LearnMore label={`More about “${stage.name}”`}>
          <p className="text-sm leading-relaxed text-muted-foreground">{stage.summary}</p>
          <VariesNote>
            Timelines vary depending on your location, housing market, and personal circumstances.
          </VariesNote>
        </LearnMore>
      </section>

      <Disclosure
        title="How to evaluate housing options"
        defaultOpen
        summary={`${HOUSING_CONSIDERATIONS.length} dimensions to weigh`}
        aside={<GuidanceBadge label="Framework" className="hidden sm:inline-flex" />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {HOUSING_CONSIDERATIONS.map((c) => (
            <article key={c.id} className="surface flex flex-col gap-2 p-4">
              <h3 className="text-base leading-snug">{c.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{c.what}</p>
              <LearnMore label="Things to consider">
                <ul className="space-y-1.5">
                  {c.questions.map((q) => (
                    <li
                      key={q}
                      className="flex gap-2 text-sm leading-relaxed text-secondary-foreground"
                    >
                      <HelpCircle
                        className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden
                      />
                      {q}
                    </li>
                  ))}
                </ul>
                <p className="rounded-lg bg-sand p-2.5 text-xs leading-relaxed text-secondary-foreground">
                  <strong className="font-semibold">Trade-off: </strong>
                  {c.tradeoff}
                </p>
                {c.local && (
                  <ul className="space-y-1 rounded-lg bg-muted p-2.5">
                    <li className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      In Toronto
                    </li>
                    {c.local.map((l) => (
                      <li key={l} className="text-xs leading-relaxed text-secondary-foreground">
                        · {l}
                      </li>
                    ))}
                  </ul>
                )}
                <SourcePending />
              </LearnMore>
            </article>
          ))}
        </div>
        <GuidanceDisclaimer />
      </Disclosure>

      <Disclosure
        title="How to read this section"
        summary="Reference, guidance and AI responses are marked differently"
      >
        <EvidenceLegend />
      </Disclosure>

      <Button size="lg" className="w-full" onClick={() => advance(1)}>
        Next: where to look
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
