import {
  ArrowRight,
  ShieldAlert,
  MapPin,
  Wallet,
  Clock,
  FileCheck,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HOUSING_TYPES,
  SCAM_PATTERNS,
  POSTING_PLACES,
  STUDENT_POSTING_PLACES,
} from "@/data/mock";
import { useFlow } from "./flow-state";
import { CautionBadge, SectionTitle, StageHeader, VariesNote } from "./primitives";

const riskTone: Record<string, string> = {
  "Lowest risk": "bg-verified-soft text-verified",
  "Medium risk": "bg-caution-soft text-caution",
  Varies: "bg-sand text-secondary-foreground",
};

export function StageOne() {
  const { advance, filters } = useFlow();
  const isStudent = filters.status === "student";

  return (
    <div className="space-y-6">
      <StageHeader
        eyebrow="Stage 1 · Where to look"
        title="Which kind of rental are you aiming at?"
        intro="Start with the category and its risk level. Open a card for prices, credit and timing."
      />

      {/* Primary question for this screen */}
      <section className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {HOUSING_TYPES.map((t) => (
            <article key={t.id} className="surface flex flex-col gap-2.5 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base leading-snug">{t.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${riskTone[t.risk]}`}
                >
                  {t.risk}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{t.blurb}</p>
              <LearnMore className="mt-auto" label="Cost, credit & timing">
                <ul className="space-y-1.5 text-xs text-secondary-foreground">
                  <li className="flex items-center gap-2">
                    <Wallet className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    {t.price}
                  </li>
                  <li className="flex items-center gap-2">
                    <FileCheck className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    {t.creditNeeded}
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    {t.speed}
                  </li>
                </ul>
                <p className="rounded-lg bg-sand p-2.5 text-xs leading-relaxed text-secondary-foreground">
                  {t.bestFor}
                </p>
              </LearnMore>
            </article>
          ))}
        </div>
        <VariesNote />
      </section>

      <Disclosure
        title="Scam patterns to walk away from"
        summary={`${SCAM_PATTERNS.length} signals that a listing is not real`}
        aside={<CautionBadge label="Safety" className="hidden sm:inline-flex" />}
      >
        <ul className="space-y-3 rounded-xl border border-caution/30 bg-caution-soft/60 p-4">
          {SCAM_PATTERNS.map((s) => (
            <li key={s.title} className="flex gap-3">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-caution" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Disclosure>

      <Disclosure
        title="Where people actually post"
        summary={`${POSTING_PLACES.length} general resources${isStudent ? " + student-specific" : ""}`}
      >
        <ul className="surface divide-y divide-border">
          {POSTING_PLACES.map((p) => (
            <li key={p.name} className="flex gap-3 p-3.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.note}</p>
              </div>
            </li>
          ))}
        </ul>
        {isStudent ? (
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-advisor">
              <GraduationCap className="size-4" aria-hidden />
              Student-specific · optional
            </p>
            <ul className="surface divide-y divide-border">
              {STUDENT_POSTING_PLACES.map((p) => (
                <li key={p.name} className="flex gap-3 p-3.5">
                  <GraduationCap className="mt-0.5 size-4 shrink-0 text-advisor" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{p.note}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Shown because your profile says you are a student. The general resources work too.
            </p>
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            General resources. If you are studying here, set your situation to “Student” in Stage 0
            to also see student-specific resources.
          </p>
        )}
      </Disclosure>

      <Button size="lg" className="w-full sm:w-auto" onClick={() => advance(2)}>
        <Sparkles className="size-4" aria-hidden />
        How to evaluate housing options
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
