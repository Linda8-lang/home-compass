import { useState, type ReactNode } from "react";
import { ChevronRight, GraduationCap, X } from "lucide-react";
import {
  DURATION_CARDS,
  HOUSING_TYPE_CARDS,
  durationResources,
  type HousingChoiceCard,
  type DurationResources,
} from "@/data/housing-sections";

/**
 * Shared card for both the duration group and the housing-type group. `onLearnMore`
 * omitted renders the card with no "Learn more" affordance at all — the housing-type
 * cards have no destination today, so there's nothing for it to open.
 */
function HousingCard({
  card,
  isStudent,
  onLearnMore,
}: {
  card: HousingChoiceCard;
  isStudent: boolean;
  onLearnMore?: () => void;
}) {
  const Icon = card.icon;
  const showStudentBadge = card.studentOnly && isStudent;

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5">
      <span className="flex size-10 items-center justify-center rounded-full bg-advisor-soft text-advisor">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-bold text-foreground">{card.title}</h3>
        {showStudentBadge && (
          <span className="inline-flex items-center gap-1 rounded-full bg-advisor-soft px-2 py-0.5 text-[11px] font-semibold text-advisor">
            <GraduationCap className="size-3" aria-hidden />
            Shown because your profile is student
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
      {onLearnMore && (
        <button
          type="button"
          onClick={onLearnMore}
          className="mt-auto inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Learn more
          <ChevronRight className="size-4" aria-hidden />
        </button>
      )}
    </article>
  );
}

/**
 * Resource detail view for a duration card's "Learn more". Reuses the app's
 * established modal pattern (see SourceCite / DataSourceCite) rather than a new one.
 */
function DurationResourceModal({
  title,
  resources,
  onClose,
}: {
  title: string;
  resources: DurationResources["resources"];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Resources for ${title}`}
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-4 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Where to look
            </p>
            <h3 className="text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close resources"
            className="rounded-lg p-1 text-muted-foreground hover:bg-sand"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Website</th>
                <th className="py-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resources.map((r) => (
                <tr key={r.name} className="align-top">
                  <td className="py-2 pr-3 font-medium text-foreground">{r.name}</td>
                  <td className="py-2 pr-3">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {r.url.replace(/^https?:\/\//, "")}
                    </a>
                  </td>
                  <td className="py-2 text-muted-foreground">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CardGroup({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{heading}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

/** Group 1 (duration) + Group 2 (housing type) card sections for "Find Housing". */
export function ChooseHousingSection({ isStudent }: { isStudent: boolean }) {
  const [openDurationId, setOpenDurationId] = useState<DurationResources["id"] | null>(null);
  const activeDuration = durationResources.find((d) => d.id === openDurationId) ?? null;
  const activeCard = DURATION_CARDS.find((c) => c.id === openDurationId) ?? null;

  return (
    <div className="space-y-6">
      <CardGroup heading="Find the duration that suits your needs">
        {DURATION_CARDS.map((card) => (
          <HousingCard
            key={card.id}
            card={card}
            isStudent={isStudent}
            onLearnMore={() => setOpenDurationId(card.id as DurationResources["id"])}
          />
        ))}
      </CardGroup>

      <CardGroup heading="Find the type of housing that suits your needs">
        {HOUSING_TYPE_CARDS.filter((c) => !c.studentOnly || isStudent).map((card) => (
          <HousingCard key={card.id} card={card} isStudent={isStudent} />
        ))}
      </CardGroup>

      {activeDuration && activeCard && (
        <DurationResourceModal
          title={activeCard.title}
          resources={activeDuration.resources}
          onClose={() => setOpenDurationId(null)}
        />
      )}
    </div>
  );
}
