import { ArrowRight, Plane, Luggage, Home, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JOURNEY_STAGES, type JourneyStageId } from "@/data/journey";
import { useFlow } from "./flow-state";
import { SectionTitle, StageHeader, CautionBadge } from "./primitives";
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

export function StageZero() {
  const { advance, journeyStage, setJourneyStage, doneTasks, toggleTask } = useFlow();
  const stage = JOURNEY_STAGES.find((s) => s.id === journeyStage) ?? JOURNEY_STAGES[0]!;
  const done = stage.tasks.filter((t) => doneTasks.includes(`${stage.id}:${t.label}`)).length;

  return (
    <div className="space-y-10">
      <StageHeader
        eyebrow="Stage 0 · Your immigration stage"
        title="Where you are in the move changes what you should be doing about housing."
        intro="Pick your stage and get the checklist for right now — then continue into the housing flow."
      />

      <section className="space-y-3">
        <SectionTitle>Pick your stage</SectionTitle>
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
      </section>

      <section className="space-y-3">
        <SectionTitle aside={<CautionBadge label="Heads up" />}>{stage.name}</SectionTitle>
        <div className="surface space-y-3 p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{stage.summary}</p>
          <p className="rounded-lg bg-verified-soft p-3 text-sm leading-relaxed text-verified">
            <strong className="font-semibold">Housing goal: </strong>
            {stage.housingGoal}
          </p>
          <p className="flex gap-2 rounded-lg bg-caution-soft p-3 text-sm leading-relaxed text-caution">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {stage.headsUp}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle
          aside={
            <span className="text-xs font-medium text-muted-foreground">
              {done} of {stage.tasks.length} done
            </span>
          }
        >
          Your checklist right now
        </SectionTitle>
        <ul className="surface divide-y divide-border">
          {stage.tasks.map((t) => {
            const key = `${stage.id}:${t.label}`;
            const checked = doneTasks.includes(key);
            return (
              <li key={t.label}>
                <button
                  type="button"
                  onClick={() => toggleTask(key)}
                  aria-pressed={checked}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <CheckCircle2
                    className={cn("mt-0.5 size-5 shrink-0", checked ? "text-verified" : "text-border")}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
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
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {t.detail}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <Button size="lg" className="w-full" onClick={() => advance(1)}>
        Next: where to look
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
