import {
  Home,
  Sparkles,
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
  const { filters, askAdvisor } = useFlow();
  const isStudent = filters.status === "student";

  const findSection = HOUSING_SECTIONS[0]!;
  const compareSection = HOUSING_SECTIONS[1]!;
  const verifySection = HOUSING_SECTIONS[2]!;

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
        >
          <div className="space-y-4">
            {COMPARE_HOUSING_GROUPS.map((g) => {
              const GroupIcon = CRITERION_GROUP_ICONS[g.id] ?? Home;

              if (g.id === "costs") {
                return (
                  <div key={g.id} className="surface p-4">
                    <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-secondary-foreground">
                      <GroupIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
                      {g.title}
                    </h3>
                    <div className="space-y-3">
                      {g.criteria.map((c) => (
                        <div key={c.id}>
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
                      ))}
                    </div>
                    <div className="mt-3">
                      <CostBreakdown />
                    </div>
                  </div>
                );
              }

              return (
                <div key={g.id} className="surface p-4">
                  <h3 className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-secondary-foreground">
                    <GroupIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
                    {g.title}
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
                        <button
                          type="button"
                          onClick={() => c.askAdvisorPrompt && askAdvisor(c.askAdvisorPrompt)}
                          className="inline-flex shrink-0 items-center gap-1 self-start rounded-full border border-advisor/40 bg-advisor-soft/50 px-2.5 py-1 text-[11px] font-semibold text-advisor transition-colors hover:bg-advisor-soft"
                        >
                          <Sparkles className="size-3" aria-hidden />
                          Ask the AI Advisor
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <GuidanceDisclaimer />
        </Disclosure>
      </div>

      <div id={verifySection.anchor}>
        <Disclosure
          title={<SectionEyebrow eyebrow={verifySection.eyebrow} title={verifySection.title} />}
          summary="Real neighbourhood crime and rent data for an address — factual, non-speculative"
        >
          <div className="space-y-4">
            <CheckThePlaceReport />
          </div>
        </Disclosure>
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
