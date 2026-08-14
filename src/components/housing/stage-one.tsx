import { ArrowRight, ShieldAlert, MapPin, Wallet, Clock, FileCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HOUSING_TYPES, SCAM_PATTERNS, POSTING_PLACES } from "@/data/mock";
import { useFlow } from "./flow-state";
import { CautionBadge, SectionTitle, StageHeader } from "./primitives";

const riskTone: Record<string, string> = {
  "Lowest risk": "bg-verified-soft text-verified",
  "Medium risk": "bg-caution-soft text-caution",
  Varies: "bg-sand text-secondary-foreground",
};

export function StageOne() {
  const { advance } = useFlow();

  return (
    <div className="space-y-10">
      <StageHeader
        eyebrow="Stage 1 · Where to look"
        title="Toronto rentals come in three kinds. Pick your risk before you pick a listing."
        intro="Applying in the wrong category costs time. A few minutes here helps you aim at the right one."
      />

      <VariesNote />

      <section className="space-y-3">
        <SectionTitle>The three categories</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-3">
          {HOUSING_TYPES.map((t) => (
            <article key={t.id} className="surface flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base leading-snug">{t.title}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${riskTone[t.risk]}`}
                >
                  {t.risk}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{t.blurb}</p>
              <ul className="space-y-1.5 text-xs text-secondary-foreground">
                <li className="flex items-center gap-2">
                  <Wallet className="size-3.5 text-muted-foreground" aria-hidden />
                  {t.price}
                </li>
                <li className="flex items-center gap-2">
                  <FileCheck className="size-3.5 text-muted-foreground" aria-hidden />
                  {t.creditNeeded}
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="size-3.5 text-muted-foreground" aria-hidden />
                  {t.speed}
                </li>
              </ul>
              <p className="mt-auto rounded-lg bg-sand p-2.5 text-xs leading-relaxed text-secondary-foreground">
                {t.bestFor}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle aside={<CautionBadge label="Know the pattern" />}>
          Scam patterns to walk away from
        </SectionTitle>
        <div className="rounded-xl border border-caution/30 bg-caution-soft/60 p-4">
          <ul className="space-y-3">
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
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle>Where people actually post</SectionTitle>
        <ul className="surface divide-y divide-border">
          {POSTING_PLACES.map((p) => (
            <li key={p.name} className="flex gap-3 p-4">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <Button size="lg" className="w-full sm:w-auto" onClick={() => advance(2)}>
        <Sparkles className="size-4" aria-hidden />
        Ask the advisor to recommend neighbourhoods
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
