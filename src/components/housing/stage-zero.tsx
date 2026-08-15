import { ArrowRight, Plane, Luggage, Home, Info, CheckCircle2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JOURNEY_STAGES, type JourneyStageId } from "@/data/journey";
import { HOUSING_CONSIDERATIONS } from "@/data/housing-considerations";
import type { NewcomerStatus } from "@/data/mock";
import { CITATIONS } from "@/data/sources";
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
import { SourceCite } from "./source-cite";
import { cn } from "@/lib/utils";


const icons: Record<JourneyStageId, typeof Plane> = {
  "pre-landing": Plane,
  "just-landed": Luggage,
  settling: Home,
};

const kindTone: Record<string, string> = {
  housing: "bg-verified-soft text-verified",
  admin: "bg-sand text-secondary-foreground",
  money: "bg-advisor-soft text-advisor",
  life: "bg-caution-soft text-caution",
};

const SITUATIONS: { id: NewcomerStatus; label: string; note: string }[] = [
  { id: "student", label: "Student", note: "Studying at a college or university here." },
  { id: "job-offer", label: "Working / job offer", note: "Moving for work or with an offer in hand." },
  { id: "other", label: "Other newcomer", note: "Family, PR, refugee claimant, or still deciding." },
];

export function StageZero() {
  const { advance, journeyStage, setJourneyStage, doneTasks, toggleTask, filters, setFilters } =
    useFlow();
  const stage = JOURNEY_STAGES.find((s) => s.id === journeyStage) ?? JOURNEY_STAGES[0]!;
  // Housing-specific tasks are intentionally excluded: this checklist stays
  // neutral and does not recommend where or what to rent.
  const tasks = stage.tasks.filter((t) => t.kind !== "housing");
  const done = tasks.filter((t) => doneTasks.includes(`${stage.id}:${t.label}`)).length;

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
        title="Your situation"
        summary={`Currently: ${situation.label}. Changes which resources you see.`}
      >
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
          Optional. Student-specific resources such as university housing boards are only shown if
          you select “Student” — everyone else sees general housing resources.
        </p>
      </Disclosure>

      <Disclosure
        title="Your checklist right now"
        summary={`${tasks.length} tasks for ${stage.name} · ${done} done`}
        defaultOpen
      >
        <ul className="surface divide-y divide-border">
          {tasks.map((t) => {
            const key = `${stage.id}:${t.label}`;
            const checked = doneTasks.includes(key);
            const cited = t.citation && CITATIONS[t.citation] ? t.citation : null;
            return (
              <li
                key={t.label}
                className={cn(
                  "flex items-start gap-3 border-l-2 p-3.5",
                  t.evidence === "reference" ? "border-l-verified/60" : "border-l-transparent",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleTask(key)}
                  aria-pressed={checked}
                  aria-label={`Mark "${t.label}" as done`}
                  className="mt-0.5 shrink-0"
                >
                  <CheckCircle2
                    className={cn("size-5", checked ? "text-verified" : "text-border")}
                    aria-hidden
                  />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        checked ? "text-muted-foreground line-through" : "text-foreground",
                      )}
                    >
                      {t.label}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize",
                        kindTone[t.kind],
                      )}
                    >
                      {t.kind}
                    </span>
                  </div>
                  <LearnMore className="mt-1.5" label="Details & source">
                    <p className="text-sm leading-relaxed text-muted-foreground">{t.detail}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {t.evidence === "reference" ? (
                        cited ? (
                          <SourceCite metric={cited} />
                        ) : (
                          <SourcePending />
                        )
                      ) : (
                        <GuidanceBadge />
                      )}
                    </div>
                  </LearnMore>
                </div>
              </li>
            );
          })}
        </ul>
        <GuidanceDisclaimer />
      </Disclosure>

      <Disclosure
        title="How to Evaluate Housing Options"
        summary={`${HOUSING_CONSIDERATIONS.length} dimensions to weigh — questions, not recommendations`}
        aside={<GuidanceBadge label="Framework" className="hidden sm:inline-flex" />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {HOUSING_CONSIDERATIONS.map((c) => (
            <article key={c.id} className="surface flex flex-col gap-2 p-4">
              <h3 className="text-base leading-snug">{c.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{c.what}</p>
              <LearnMore label="Questions & trade-off">
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
