import {
  Building2,
  Home,
  Users,
  GraduationCap,
  ShieldCheck,
  MapPin,
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
import {
  HOUSING_SECTIONS,
  FIND_HOUSING_CATEGORIES,
  FIND_HOUSING_NOTE,
  FIND_HOUSING_RESOURCES,
  FIND_HOUSING_STUDENT_RESOURCES,
  COMPARE_HOUSING_GROUPS,
  VERIFY_THE_PLACE_GROUPS,
} from "@/data/housing-sections";
import { Disclosure, DisclaimerBadge, StaticDisclaimer, GuidanceDisclaimer } from "./primitives";
import { SourceCite } from "./source-cite";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, typeof Building2> = {
  managed: Building2,
  owner: Home,
  rooms: Users,
  university: GraduationCap,
};

/** One icon per Evaluate Housing group, keyed by CriterionGroup.id — purely visual scanning aid. */
const CRITERION_GROUP_ICONS: Record<string, typeof Building2> = {
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
          summary="Categories of rental housing to search — no risk ratings, no timelines"
          defaultOpen
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {FIND_HOUSING_CATEGORIES.filter((c) => !c.studentOnly || isStudent).map((c) => {
              const Icon = CATEGORY_ICONS[c.id] ?? Home;
              return (
                <article key={c.id} className="surface flex flex-col gap-2 p-4">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-sand text-secondary-foreground">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <h3 className="text-base leading-snug">{c.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{c.description}</p>
                  {c.studentOnly && (
                    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-advisor-soft px-2 py-0.5 text-[11px] font-semibold text-advisor">
                      <GraduationCap className="size-3" aria-hidden />
                      Shown because your profile is Student
                    </span>
                  )}
                </article>
              );
            })}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{FIND_HOUSING_NOTE}</p>

          <div className="space-y-2 border-t border-border/70 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              General resources
            </p>
            <ul className="surface divide-y divide-border">
              {FIND_HOUSING_RESOURCES.map((r) => (
                <li key={r.name} className="flex gap-3 p-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.name}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{r.note}</p>
                  </div>
                </li>
              ))}
            </ul>
            {isStudent ? (
              <div className="space-y-2">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-advisor">
                  <GraduationCap className="size-3.5" aria-hidden />
                  Student-specific
                </p>
                <ul className="surface divide-y divide-border">
                  {FIND_HOUSING_STUDENT_RESOURCES.map((r) => (
                    <li key={r.name} className="flex gap-3 p-3">
                      <GraduationCap className="mt-0.5 size-4 shrink-0 text-advisor" aria-hidden />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{r.name}</p>
                        <p className="text-sm leading-relaxed text-muted-foreground">{r.note}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs leading-relaxed text-muted-foreground">
                Set your situation to "Student" in Column 1 to also see student-specific resources.
              </p>
            )}
          </div>
        </Disclosure>
      </div>

      <div id={compareSection.anchor}>
        <Disclosure
          title={<SectionEyebrow eyebrow={compareSection.eyebrow} title={compareSection.title} />}
          summary="A factual evaluation checklist — no listings, cards, prices, or addresses"
        >
          <div className="space-y-4">
            {COMPARE_HOUSING_GROUPS.map((g) => {
              const GroupIcon = CRITERION_GROUP_ICONS[g.id] ?? Home;
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
                          onClick={() => askAdvisor(c.askAdvisorPrompt)}
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
          summary="Document prep and scam-avoidance checks — factual, non-speculative"
        >
          <div className="space-y-4">
            {VERIFY_THE_PLACE_GROUPS.map((g) => (
              <div key={g.id} className="surface p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary-foreground">
                    {g.title}
                  </h3>
                  {g.id === "documents" && <SourceCite metric="depositRules" compact />}
                </div>
                <ul className="space-y-2">
                  {g.items.map((it) => (
                    <li
                      key={it.id}
                      className="flex gap-2 text-sm leading-relaxed text-secondary-foreground"
                    >
                      <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-verified" aria-hidden />
                      {it.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
