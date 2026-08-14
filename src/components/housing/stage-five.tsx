import { useState } from "react";
import { Banknote, CircleHelp, PartyPopper } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BASE_DOCS, DOC_PATHS, PAYMENT_NOTES } from "@/data/mock";
import { useFlow } from "./flow-state";
import { AdvisorBadge, SectionTitle, StageHeader, VerifiedBadge } from "./primitives";
import { SourceCite } from "./source-cite";

const statusLabel = {
  student: "Student",
  "job-offer": "Job offer",
  other: "Other",
} as const;

export function StageFive() {
  const { filters } = useFlow();
  const [noCredit, setNoCredit] = useState(true);
  const [done, setDone] = useState<string[]>([]);
  const paths = DOC_PATHS[filters.status];

  const items = [...BASE_DOCS, ...(noCredit ? paths.map((p) => p.label) : ["Canadian credit report"])];
  const completed = items.filter((i) => done.includes(i)).length;
  const pct = Math.round((completed / items.length) * 100);

  function toggle(item: string) {
    setDone((d) => (d.includes(item) ? d.filter((x) => x !== item) : [...d, item]));
  }

  return (
    <div className="space-y-9 pb-8">
      <StageHeader
        eyebrow="Stage 5 · Application prep"
        title="Get your documents in order before you view."
        intro={`Built for your situation — ${statusLabel[filters.status]} moving to Toronto. We won't ask again.`}
      />

      <section className="surface space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Label htmlFor="credit" className="text-sm font-semibold">
              No Canadian credit history?
            </Label>
            <p className="text-xs text-muted-foreground">
              Turning this on swaps the credit report for alternate proof-of-income paths.
            </p>
          </div>
          <Switch id="credit" checked={noCredit} onCheckedChange={setNoCredit} />
        </div>

        {noCredit && (
          <div className="space-y-3">
            <SectionTitle aside={<AdvisorBadge />}>Alternate paths, fastest first</SectionTitle>
            {paths.map((p) => (
              <article key={p.label} className="rounded-lg border border-border bg-sand p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {p.rank}. {p.label}
                  </p>
                  <span className="shrink-0 rounded-full bg-card px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                    {p.speed}
                  </span>
                </div>
                <p className="mt-1 flex gap-2 text-sm leading-relaxed text-muted-foreground">
                  <CircleHelp className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  {p.why}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <SectionTitle
          aside={
            <span className="flex items-center gap-2">
              <VerifiedBadge label="Ontario rules" />
              <SourceCite metric="depositRules" compact />
            </span>
          }
        >
          <span className="inline-flex items-center gap-2">
            <Banknote className="size-4 text-verified" aria-hidden />
            What you'll pay up front
          </span>
        </SectionTitle>
        <ul className="surface divide-y divide-border">
          {PAYMENT_NOTES.map((n) => (
            <li key={n.title} className="p-4">
              <p className="text-sm font-semibold text-foreground">{n.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{n.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <SectionTitle
          aside={
            <span className="text-xs font-medium text-muted-foreground">
              {completed} of {items.length} gathered
            </span>
          }
        >
          Your checklist
        </SectionTitle>
        <Progress value={pct} className="h-2" />
        <ul className="surface divide-y divide-border">
          {items.map((item) => (
            <li key={item}>
              <label className="flex cursor-pointer items-center gap-3 p-3.5">
                <Checkbox checked={done.includes(item)} onCheckedChange={() => toggle(item)} />
                <span
                  className={
                    done.includes(item)
                      ? "text-sm text-muted-foreground line-through"
                      : "text-sm text-foreground"
                  }
                >
                  {item}
                </span>
              </label>
            </li>
          ))}
        </ul>
        {pct === 100 && (
          <p className="flex items-center gap-2 rounded-xl bg-verified-soft p-4 text-sm font-medium text-verified">
            <PartyPopper className="size-4" aria-hidden />
            Everything's gathered — you're ready to apply with confidence.
          </p>
        )}
      </section>
    </div>
  );
}
