import { BookOpen, Plane, Luggage, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlow, type NewcomerStatus } from "./flow-state";
import { JOURNEY_STAGES, type JourneyStageId } from "@/data/journey";
import { HOUSING_SECTIONS } from "@/data/housing-sections";
import { LearnMore } from "./primitives";

const STAGE_ICONS: Record<JourneyStageId, typeof Plane> = {
  "pre-landing": Plane,
  "just-landed": Luggage,
  settling: Home,
};

const PERSONA_OPTIONS: { value: NewcomerStatus; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "job-offer", label: "Job offer" },
  { value: "other", label: "Other" },
];

function scrollToSection(anchor: string) {
  if (typeof document === "undefined") return;
  document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Column 1 — categories / index / navigation. Sets the persona and immigration
 * stage that Column 2 and the AI Advisor read, plus jump links to each section. */
export function ColumnOne() {
  const { filters, setFilters, journeyStage, setJourneyStage } = useFlow();
  const stage = JOURNEY_STAGES.find((s) => s.id === journeyStage) ?? JOURNEY_STAGES[0]!;

  return (
    <nav aria-label="Housing categories and navigation" className="space-y-5 lg:sticky lg:top-20">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Your situation
        </p>
        <div className="grid grid-cols-3 gap-1.5 lg:grid-cols-1">
          {PERSONA_OPTIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setFilters({ ...filters, status: p.value })}
              aria-pressed={filters.status === p.value}
              className={cn(
                "rounded-lg border px-2 py-1.5 text-center text-xs font-medium transition-colors lg:text-left",
                filters.status === p.value
                  ? "border-primary bg-sand text-foreground"
                  : "border-border text-muted-foreground hover:bg-sand/60",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 hidden text-[11px] leading-relaxed text-muted-foreground lg:block">
          Set to "Student" to also see University Housing Boards.
        </p>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Your stage
        </p>
        <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {JOURNEY_STAGES.map((s) => {
            const Icon = STAGE_ICONS[s.id];
            const active = journeyStage === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setJourneyStage(s.id)}
                aria-pressed={active}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs font-medium transition-colors lg:shrink",
                  active
                    ? "border-primary bg-sand text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-sand/60",
                )}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                {s.name}
              </button>
            );
          })}
        </div>
        <LearnMore label="Heads up for this stage" className="mt-2">
          <p className="text-xs leading-relaxed text-muted-foreground">{stage.headsUp}</p>
        </LearnMore>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <BookOpen className="size-3.5" aria-hidden />
          Reference index
        </p>
        <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {HOUSING_SECTIONS.map((s, i) => (
            <li key={s.id} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => scrollToSection(s.anchor)}
                className="w-full rounded-xl border border-transparent px-3 py-2 text-left transition-colors hover:border-border hover:bg-sand/60"
              >
                <span className="block text-sm font-medium text-foreground">
                  <span className="text-muted-foreground">{i + 1}. </span>
                  {s.eyebrow}
                </span>
                <span className="hidden text-xs text-muted-foreground lg:block">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <details className="mt-3 hidden rounded-xl bg-sand p-3 lg:block">
          <summary className="cursor-pointer text-xs font-medium text-secondary-foreground">
            About this section
          </summary>
          <p className="mt-2 text-xs leading-relaxed text-secondary-foreground">
            These pages are static reference material. Anything that recommends a specific place
            to live lives in the AI Advisor.
          </p>
        </details>
      </div>
    </nav>
  );
}
