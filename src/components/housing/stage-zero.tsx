import { ArrowRight, Plane, Luggage, Home, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JOURNEY_STAGES, type JourneyStageId } from "@/data/journey";
import type { NewcomerStatus } from "@/data/mock";
import { useFlow } from "./flow-state";
import { StageHeader, VariesNote, LearnMore } from "./primitives";
import { cn } from "@/lib/utils";

const icons: Record<JourneyStageId, typeof Plane> = {
  "pre-landing": Plane,
  "just-landed": Luggage,
  settling: Home,
};

const SITUATIONS: { id: NewcomerStatus; label: string; note: string }[] = [
  { id: "student", label: "Student", note: "Studying at a college or university here." },
  {
    id: "job-offer",
    label: "Working / job offer",
    note: "Moving for work or with an offer in hand.",
  },
  {
    id: "other",
    label: "Other newcomer",
    note: "Family, PR, refugee claimant, or still deciding.",
  },
];

// NOTE(product): the stage-specific checklist that used to live here has
// moved — it's now an end-state screen (Stage 5's checklist) that pulls
// completable items from across the journey, rather than a standalone early
// screen. JOURNEY_STAGES.tasks is preserved as the source content; nothing
// was deleted. See docs/user-and-data-flow.md for the current flow.
//
// NOTE(product): the "How to Evaluate Housing Options" preview that used to
// be duplicated here was removed — it's a full duplicate of Stage 2's
// dedicated screen. This screen now links there instead of repeating it.

export function StageZero() {
  const { advance, journeyStage, setJourneyStage, filters, setFilters } = useFlow();
  const stage = JOURNEY_STAGES.find((s) => s.id === journeyStage) ?? JOURNEY_STAGES[0]!;
  const situation = SITUATIONS.find((s) => s.id === filters.status) ?? SITUATIONS[2]!;

  return (
    <div className="space-y-6">
      <StageHeader
        eyebrow="Stage 0 · Your immigration stage"
        title="Where are you in the move?"
        intro="Pick your stage — everything below adapts to it. Open only the parts you need right now."
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
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-sand text-secondary-foreground",
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

      {/*
        "Your situation" now sits directly in the primary onboarding
        section — not as a separate collapsed Disclosure — since it's part
        of the same onboarding question as immigration stage, not a bonus
        extra step.
      */}
      <section className="space-y-3">
        <div>
          <h3 className="font-display text-base font-semibold">Your situation</h3>
          <p className="text-xs text-muted-foreground">
            Currently: {situation.label}. Changes which resources you see.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {SITUATIONS.map((s) => {
            const active = filters.status === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setFilters({ ...filters, status: s.id })}
                aria-pressed={active}
                className={cn(
                  "surface flex flex-col gap-1 p-4 text-left transition-colors",
                  active ? "border-primary ring-2 ring-primary/25" : "hover:border-primary/40",
                )}
              >
                <h3 className="text-base leading-snug">{s.label}</h3>
                <p className="text-xs text-muted-foreground">{s.note}</p>
              </button>
            );
          })}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Student-specific resources such as university housing boards are only shown if you select
          “Student” — everyone else sees general housing resources.
        </p>
      </section>

      <Button size="lg" className="w-full" onClick={() => advance(1)}>
        Next: where to look
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
