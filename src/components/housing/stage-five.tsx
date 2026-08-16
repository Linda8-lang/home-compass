import { useState } from "react";
import {
  CircleHelp,
  PartyPopper,
  CheckCircle2,
  ScrollText,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BASE_DOCS, DOC_PATHS, PAYMENT_NOTES, MOVE_IN_BASICS } from "@/data/mock";
import { JOURNEY_STAGES } from "@/data/journey";
import { useFlow } from "./flow-state";
import {
  AdvisorBadge,
  SectionTitle,
  StageHeader,
  VariesNote,
  VerifiedBadge,
  EvidenceLegend,
  GuidanceDisclaimer,
  Disclosure,
} from "./primitives";

import { SourceCite } from "./source-cite";
import { cn } from "@/lib/utils";

const statusLabel = {
  student: "Student",
  "job-offer": "Job offer",
  other: "Other",
} as const;

/**
 * Lightweight, deterministic keyword checks against Ontario norms already
 * documented in this app (PAYMENT_NOTES, sources.ts). This is intentionally
 * NOT an AI call — a lighter, rule-based flagging tool, not a legal review.
 * Reinstated per supervisor feedback: lease review is back in scope as a
 * lighter feature than the earlier full lease-completeness checker.
 */
type LeaseFlag = { tone: "watch" | "info"; text: string };

function checkLeaseText(text: string): LeaseFlag[] {
  const t = text.toLowerCase();
  const flags: LeaseFlag[] = [];

  if (t.includes("damage deposit") || t.includes("cleaning deposit")) {
    flags.push({
      tone: "watch",
      text: "Mentions a damage or cleaning deposit — Ontario does not permit these as a separate deposit. Worth asking about directly.",
    });
  }
  if (!t.includes("last month") && !t.includes("last month's rent")) {
    flags.push({
      tone: "info",
      text: "Didn't find a mention of last month's rent as a deposit — confirm what deposit is actually being asked for.",
    });
  }
  if (t.includes("no sublet") || t.includes("subletting is not") || t.includes("may not sublet")) {
    flags.push({
      tone: "info",
      text: "Restricts subletting. Not unusual, but worth knowing before you sign if your plans might change.",
    });
  }
  if (t.includes("month-to-month") || t.includes("month to month")) {
    flags.push({
      tone: "info",
      text: "Reads as month-to-month rather than a fixed term — more flexible, but usually less price stability.",
    });
  }
  if (t.length > 0 && flags.length === 0) {
    flags.push({
      tone: "info",
      text: "No obvious red flags from this quick pattern check — that doesn't replace reading the full lease yourself.",
    });
  }
  return flags;
}

export function StageFive() {
  const { filters, journeyStage, doneTasks, toggleTask } = useFlow();
  const [noCredit, setNoCredit] = useState(true);
  const [done, setDone] = useState<string[]>([]);
  const [leaseText, setLeaseText] = useState("");
  const [leaseFlags, setLeaseFlags] = useState<LeaseFlag[] | null>(null);
  const paths = DOC_PATHS[filters.status];

  const items = [
    ...BASE_DOCS,
    ...(noCredit ? paths.map((p) => p.label) : ["Canadian credit report"]),
  ];
  const completed = items.filter((i) => done.includes(i)).length;

  // Earlier-journey tasks, pulled in here rather than shown as their own
  // early screen — this is the "checklist moves to the end" restructure.
  const stage = JOURNEY_STAGES.find((s) => s.id === journeyStage) ?? JOURNEY_STAGES[0]!;
  const journeyTasks = stage.tasks.filter((t) => t.kind !== "housing");
  const journeyDone = journeyTasks.filter((t) =>
    doneTasks.includes(`${stage.id}:${t.label}`),
  ).length;

  const totalItems = items.length + journeyTasks.length;
  const totalDone = completed + journeyDone;
  const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  function toggle(item: string) {
    setDone((d) => (d.includes(item) ? d.filter((x) => x !== item) : [...d, item]));
  }

  return (
    <div className="space-y-6 pb-8">
      <StageHeader
        eyebrow="Stage 5 · Application prep"
        title="Get your documents in order before you view."
        intro={`Built for your situation — ${statusLabel[filters.status]} moving to Toronto. We won't ask again.`}
      />

      <VariesNote>
        Landlord and bank requirements vary by provider and circumstance — confirm directly with
        them.
      </VariesNote>

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

      <Disclosure
        title="What you'll pay up front"
        summary={`${PAYMENT_NOTES.length} things to expect before you get keys`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <VerifiedBadge label="Ontario rules" />
          <SourceCite metric="depositRules" compact />
        </div>
        <ul className="surface divide-y divide-border">
          {PAYMENT_NOTES.map((n) => (
            <li key={n.title} className="p-3.5">
              <p className="text-sm font-semibold text-foreground">{n.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{n.detail}</p>
            </li>
          ))}
        </ul>
      </Disclosure>

      <Disclosure
        title="Moving-in & setup basics"
        summary={`${MOVE_IN_BASICS.length} things to line up around move-in day`}
      >
        <ul className="surface divide-y divide-border">
          {MOVE_IN_BASICS.map((n) => (
            <li key={n.title} className="p-3.5">
              <p className="text-sm font-semibold text-foreground">{n.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{n.detail}</p>
            </li>
          ))}
        </ul>
        <GuidanceDisclaimer />
      </Disclosure>

      <Disclosure
        title="Lease review"
        summary="Paste your lease text for a quick pattern check — lighter than a full legal review"
        aside={<AdvisorBadge label="Pattern check" />}
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Paste the text of your lease below. This checks for a small number of known patterns
          against Ontario norms — it is not a legal review, and does not replace reading the lease
          yourself or checking it against the official Ontario Standard Lease form.
        </p>
        <Textarea
          value={leaseText}
          onChange={(e) => setLeaseText(e.target.value)}
          rows={6}
          placeholder="Paste your lease text here…"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => setLeaseFlags(checkLeaseText(leaseText))}
          disabled={leaseText.trim().length === 0}
        >
          <ScrollText className="size-4" aria-hidden />
          Check my lease
        </Button>
        {leaseFlags && (
          <ul className="space-y-2">
            {leaseFlags.map((f, i) => (
              <li
                key={i}
                className={cn(
                  "flex gap-2 rounded-lg border p-3 text-sm leading-relaxed",
                  f.tone === "watch"
                    ? "border-caution/40 bg-caution-soft/60 text-caution"
                    : "border-border bg-sand text-secondary-foreground",
                )}
              >
                {f.tone === "watch" ? (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
                ) : (
                  <ShieldCheck
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                )}
                {f.text}
              </li>
            ))}
          </ul>
        )}
        <GuidanceDisclaimer />
      </Disclosure>

      <section className="space-y-5">
        <SectionTitle
          aside={
            <span className="text-xs font-medium text-muted-foreground">
              {totalDone} of {totalItems} gathered
            </span>
          }
        >
          Your checklist
        </SectionTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Pulled together from earlier in your journey, not a separate task list — check things off
          as you go.
        </p>
        <Progress value={pct} className="h-2" />

        {journeyTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              From your {stage.name} stage
            </p>
            <ul className="surface divide-y divide-border">
              {journeyTasks.map((t) => {
                const key = `${stage.id}:${t.label}`;
                const checked = doneTasks.includes(key);
                return (
                  <li key={t.label} className="flex items-start gap-3 p-3.5">
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
                    <span
                      className={
                        checked
                          ? "text-sm text-muted-foreground line-through"
                          : "text-sm text-foreground"
                      }
                    >
                      {t.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Application documents
          </p>
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
        </div>

        {pct === 100 && (
          <p className="flex items-center gap-2 rounded-xl bg-verified-soft p-4 text-sm font-medium text-verified">
            <PartyPopper className="size-4" aria-hidden />
            Everything's gathered — you're ready to apply with confidence.
          </p>
        )}
      </section>

      <Disclosure
        title="How to read this section"
        summary="Reference, guidance and AI responses are marked differently"
      >
        <EvidenceLegend />
        <GuidanceDisclaimer />
      </Disclosure>
    </div>
  );
}
