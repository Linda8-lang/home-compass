import {
  Home,
  Wallet,
  Bus,
  FileText,
  ClipboardList,
  Clock,
  Handshake,
  MessageCircle,
} from "lucide-react";
import { useFlow } from "./flow-state";
import { HOUSING_SECTIONS, COMPARE_HOUSING_GROUPS } from "@/data/housing-sections";
import { Disclosure, DisclaimerBadge, StaticDisclaimer, GuidanceDisclaimer } from "./primitives";
import { CheckThePlaceReport } from "./check-the-place-report";
import { ChooseHousingSection } from "./choose-housing";
import { CostBreakdown } from "./cost-breakdown";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/** One icon per Evaluate Housing group, keyed by CriterionGroup.id — purely visual scanning aid. */
const CRITERION_GROUP_ICONS: Record<string, typeof Home> = {
  "living-setup": Home,
  costs: Wallet,
  commute: Bus,
  "lease-rent-control": FileText,
  documents: ClipboardList,
  strategy: Clock,
  negotiation: Handshake,
  application: MessageCircle,
};

/**
 * Column 2 — the static reference lane. Renders exactly the three data-driven
 * sections (Find Housing, Evaluate Housing, Verify the Place). Nothing
 * here is hardcoded copy for a category or checklist item — it all comes from
 * src/data/housing-sections.ts, and nothing here resembles a listing card.
 */
export function ColumnTwo() {
  const { filters, isCriterionReviewed: isReviewed, toggleCriterionReviewed: toggle } = useFlow();
  const isStudent = filters.status === "student";

  const findSection = HOUSING_SECTIONS[0]!;
  const compareSection = HOUSING_SECTIONS[1]!;
  const verifySection = HOUSING_SECTIONS[2]!;

  const totalCriteria = COMPARE_HOUSING_GROUPS.reduce((sum, g) => sum + g.criteria.length, 0);
  const reviewedCriteria = COMPARE_HOUSING_GROUPS.reduce(
    (sum, g) => sum + g.criteria.filter((c) => isReviewed(c.id)).length,
    0,
  );

  return (
    <main aria-label="Static reference" className="min-w-0 space-y-4">
      <div className="sticky top-14 z-10 -mx-1 bg-background/90 px-1 pb-2 pt-3 backdrop-blur">
        <DisclaimerBadge />
      </div>

      <div id={findSection.anchor}>
        <Disclosure
          title={<SectionEyebrow eyebrow={findSection.eyebrow} title={findSection.title} />}
          summary="Pick a duration and a housing type — no risk ratings, no timelines"
          defaultOpen
        >
          <ChooseHousingSection isStudent={isStudent} />
        </Disclosure>
      </div>

      <div id={compareSection.anchor}>
        <Disclosure
          title={<SectionEyebrow eyebrow={compareSection.eyebrow} title={compareSection.title} />}
          summary="A factual evaluation checklist, plus real neighbourhood crime and rent data — no listings, cards, prices, or addresses"
          aside={<ReviewProgressBadge reviewed={reviewedCriteria} total={totalCriteria} />}
        >
          <div className="space-y-4">
            {COMPARE_HOUSING_GROUPS.map((g) => {
              const GroupIcon = CRITERION_GROUP_ICONS[g.id] ?? Home;
              const groupReviewed = g.criteria.filter((c) => isReviewed(c.id)).length;

              return (
                <div key={g.id} className="surface p-4">
                  <h3 className="mb-2.5 flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-secondary-foreground">
                      <GroupIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
                      {g.title}
                    </span>
                    <span className="text-[11px] font-medium normal-case text-muted-foreground">
                      {groupReviewed}/{g.criteria.length} reviewed
                    </span>
                  </h3>
                  <ul className="space-y-3">
                    {g.criteria.map((c) => (
                      <li
                        key={c.id}
                        className={cn(
                          "flex flex-col gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0",
                          "sm:flex-row sm:items-start sm:justify-between sm:gap-3",
                        )}
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{c.label}</p>
                          <p className="text-sm leading-relaxed text-secondary-foreground">
                            {c.bullet}
                          </p>
                          {c.note && (
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                              Note: {c.note}
                            </p>
                          )}
                        </div>
                        <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 self-start rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground transition-colors hover:bg-muted">
                          <Checkbox
                            checked={isReviewed(c.id)}
                            onCheckedChange={() => toggle(c.id)}
                            aria-label={`Mark "${c.label}" as reviewed`}
                          />
                          Reviewed
                        </label>
                      </li>
                    ))}
                  </ul>
                  {g.id === "costs" && (
                    <div className="mt-3">
                      <CostBreakdown />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <GuidanceDisclaimer />
        </Disclosure>
      </div>

      <div id={verifySection.anchor}>
        <CheckThePlaceReport />
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <StaticDisclaimer />
        <p className="text-xs text-muted-foreground">
          Prototype — the checklists above are informational, not curated recommendations.
        </p>
      </div>
    </main>
  );
}

function SectionEyebrow({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <span>
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {eyebrow}
      </span>
      <span className="block text-base font-semibold text-foreground">{title}</span>
    </span>
  );
}

/** Local-only progress indicator for the Evaluate Housing checklist — no analytics/tracking calls. */
function ReviewProgressBadge({ reviewed, total }: { reviewed: number; total: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground">
      {reviewed}/{total} reviewed
    </span>
  );
}
