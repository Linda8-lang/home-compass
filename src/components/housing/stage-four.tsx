import { useMemo, useState } from "react";
import {
  ArrowRight,
  Copy,
  Check,
  Highlighter,
  ClipboardList,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANDLORD_CHECKLIST, LISTINGS } from "@/data/mock";
import { cn } from "@/lib/utils";
import { useFlow } from "./flow-state";
import { AdvisorBadge, SectionTitle, StageHeader } from "./primitives";

const statusLabel = {
  student: "grad student, no Canadian credit history",
  "job-offer": "new hire with a signed offer, no Canadian credit history",
  other: "newcomer without Canadian credit history",
} as const;

const kindStyle = {
  leverage: "border-verified/40 bg-verified-soft/60",
  risk: "border-caution/40 bg-caution-soft/60",
  neutral: "border-border bg-sand",
} as const;

export function StageFour() {
  const { advance, chosenListing, filters } = useFlow();
  const listing = LISTINGS.find((l) => l.id === chosenListing) ?? LISTINGS[0]!;
  const checklist = LANDLORD_CHECKLIST[filters.status];
  const [copied, setCopied] = useState<string | null>(null);

  const leverage = listing.postingQuotes.filter((q) => q.kind === "leverage").length;
  const leverageLevel = leverage >= 3 ? "strong" : leverage >= 1 ? "some" : "little";

  const templates = useMemo(() => {
    const opener =
      filters.status === "student"
        ? "I'm starting a graduate program at " + filters.destination + " this fall"
        : filters.status === "job-offer"
          ? "I'm relocating to Toronto for a new role and have a signed offer in hand"
          : "I'm relocating to Toronto and have funds set aside for the full lease term";

    const proof =
      filters.status === "student"
        ? "my admission and funding letters, plus a bank letter covering the year's rent"
        : filters.status === "job-offer"
          ? "my signed offer letter with salary and start date, plus an HR verification letter"
          : "a bank letter showing 12 months of rent available, plus a reference from my previous landlord";

    return [
      {
        id: "first",
        title: "First contact",
        note: "Lead with what replaces credit. Don't apologise for being new.",
        body: `Hi — I'm interested in ${listing.address} (${listing.type}, $${listing.rent}/mo).\n\n${opener}, so I don't have Canadian credit history yet. What I can provide instead: ${proof}, and first + last month's rent ready on signing.\n\nI can view the unit any day this week, in person or by video call. Would Thursday or Saturday work?`,
      },
      {
        id: "rent",
        title: "Negotiating rent",
        note:
          leverageLevel === "strong"
            ? `The unit has been listed ${listing.daysListed} days — anchor on the vacancy, not on your budget.`
            : "Little price leverage here. Ask for value instead of a lower number.",
        body:
          leverageLevel === "strong"
            ? `Thanks for showing me the unit — I'd like to move forward.\n\nI noticed the listing has been up for about ${listing.daysListed} days. I can sign a 12-month lease this week and pay first + last on signing. Would you consider $${listing.rent - 90}/mo?\n\nIf the rent is fixed, I'd be glad to sign at $${listing.rent} with the first two weeks free while the unit is vacant — either works for me.`
            : `Thanks for showing me the unit — I'd like to move forward.\n\nI understand the rent is competitive for the area. Rather than the monthly price, would you consider including the locker/parking, or a mid-month start so I'm not paying two rents in the transition? I can sign this week and pay first + last on signing.`,
      },
      {
        id: "date",
        title: "Negotiating move-in date",
        note: "A vacant unit means the landlord wants an earlier start than you do — trade it.",
        body: `One last thing before I sign: my flight lands on the 8th, so a start date of the 10th would let me move in directly rather than pay for a hotel.\n\nIf you need the 1st, I'm happy to start the lease then and take possession on the 10th — I'd just ask for the prorated difference off the first month. Whichever is easier for you.`,
      },
    ];
  }, [filters.status, filters.destination, listing, leverageLevel]);

  return (
    <div className="space-y-9">
      <StageHeader
        eyebrow="Stage 4 · Position & negotiate"
        title="You have more leverage than you think. Here's exactly where it is."
        intro={`Tailored to you: ${statusLabel[filters.status]}, applying for ${listing.address}.`}
      />

      <section className="space-y-3">
        <SectionTitle aside={<AdvisorBadge />}>
          <span className="inline-flex items-center gap-2">
            <Highlighter className="size-4 text-advisor" aria-hidden />
            Reading the posting
          </span>
        </SectionTitle>
        <div className="surface space-y-3 p-4">
          <p className="text-sm text-muted-foreground">
            {listing.type} · ${listing.rent.toLocaleString()}/mo · listed {listing.daysListed} days
            ago
          </p>
          <ul className="space-y-2.5">
            {listing.postingQuotes.map((q) => (
              <li key={q.text} className={cn("rounded-lg border p-3", kindStyle[q.kind])}>
                <p className="text-sm font-semibold text-foreground">{q.text}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{q.read}</p>
              </li>
            ))}
          </ul>
          <p className="rounded-lg bg-advisor-soft p-3 text-sm leading-relaxed text-advisor">
            Overall: you have <strong>{leverageLevel}</strong> negotiating room on this listing. The
            templates below are written for that position.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle aside={<AdvisorBadge />}>
          <span className="inline-flex items-center gap-2">
            <ClipboardList className="size-4 text-advisor" aria-hidden />
            What landlords want — and what you offer instead
          </span>
        </SectionTitle>
        <div className="surface divide-y divide-border">
          {checklist.map((c) => (
            <div key={c.need} className="grid gap-2 p-4 sm:grid-cols-[1fr_1.4fr]">
              <div>
                <p className="text-sm font-semibold text-foreground">{c.need}</p>
                <p className="text-xs text-muted-foreground">{c.youHave}</p>
              </div>
              <div className="rounded-lg bg-sand p-3">
                <span
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-wide",
                    c.strength === "strong" ? "text-verified" : "text-caution",
                  )}
                >
                  {c.strength === "strong" ? "Strong substitute" : "Supporting substitute"}
                </span>
                <p className="mt-1 text-sm leading-relaxed text-secondary-foreground">
                  {c.substitute}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle aside={<AdvisorBadge />}>
          <span className="inline-flex items-center gap-2">
            <MessageSquareText className="size-4 text-advisor" aria-hidden />
            Messages you can send
          </span>
        </SectionTitle>
        <div className="space-y-3">
          {templates.map((t) => (
            <article key={t.id} className="surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base">{t.title}</h3>
                  <p className="text-xs text-muted-foreground">{t.note}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(t.body);
                    setCopied(t.id);
                    setTimeout(() => setCopied(null), 1600);
                  }}
                >
                  {copied === t.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied === t.id ? "Copied" : "Copy"}
                </Button>
              </div>
              <p className="mt-3 whitespace-pre-line rounded-lg bg-advisor-soft/70 p-3 text-sm leading-relaxed text-foreground">
                {t.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <Button size="lg" className="w-full" onClick={() => advance(5)}>
        I'm ready to apply
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
