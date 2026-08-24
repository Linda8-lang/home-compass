import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Check, ChevronRight, GraduationCap, X } from "lucide-react";
import {
  DURATION_CARDS,
  HOUSING_TYPE_CARDS,
  durationResources,
  housingTypeResources,
  type HousingChoiceCard,
  type HousingResource,
} from "@/data/housing-sections";
import { useFlow } from "./flow-state";
import { cn } from "@/lib/utils";

/** Every card that can open the resource modal, duration and housing-type alike, keyed by id. */
const RESOURCE_LISTS: { id: string; resources: HousingResource[] }[] = [
  ...durationResources,
  ...housingTypeResources,
];
const ALL_CARDS: HousingChoiceCard[] = [...DURATION_CARDS, ...HOUSING_TYPE_CARDS];

/**
 * Shared card for both the duration group and the housing-type group. `onLearnMore`
 * opens the shared resources modal. `onSelect`/`selected` makes the housing-type
 * cards themselves clickable (single-select) — the selection is lifted into
 * FlowProvider so the AI Advisor can see which type the user picked. Duration
 * cards get `onLearnMore` only; housing-type cards get both.
 */
function HousingCard({
  card,
  isStudent,
  onLearnMore,
  onSelect,
  selected,
}: {
  card: HousingChoiceCard;
  isStudent: boolean;
  onLearnMore?: () => void;
  onSelect?: () => void;
  selected?: boolean;
}) {
  const Icon = card.icon;
  const showStudentBadge = card.studentOnly && isStudent;
  const isSelectable = Boolean(onSelect);

  const handleLearnMoreClick = (e: MouseEvent<HTMLButtonElement>) => {
    // Nested inside the selectable wrapper below — stop it from also toggling selection.
    e.stopPropagation();
    onLearnMore?.();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (!onSelect) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <article
      {...(isSelectable
        ? {
            role: "button" as const,
            tabIndex: 0,
            "aria-pressed": selected,
            onClick: onSelect,
            onKeyDown: handleKeyDown,
          }
        : {})}
      className={cn(
        "flex flex-col items-start gap-3 rounded-xl border bg-white p-5 text-left transition-colors",
        isSelectable && "cursor-pointer",
        isSelectable
          ? selected
            ? "border-advisor ring-1 ring-advisor"
            : "border-gray-200 hover:border-advisor/50"
          : "border-gray-200",
      )}
    >
      <span
        className={cn(
          "flex size-10 items-center justify-center rounded-full bg-advisor-soft text-advisor",
          selected && "bg-advisor text-white",
        )}
      >
        {selected ? (
          <Check className="size-5" aria-hidden />
        ) : (
          <Icon className="size-5" aria-hidden />
        )}
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
          onClick={handleLearnMoreClick}
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
 * Resource detail view for a card's "Learn more" — shared by every card in both
 * the duration group and the housing-type group, university included. Reuses the
 * app's established modal pattern (see SourceCite / DataSourceCite) rather than a new one.
 */
function ResourceModal({
  title,
  resources,
  onClose,
}: {
  title: string;
  resources: HousingResource[];
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
  const [openResourceId, setOpenResourceId] = useState<string | null>(null);
  const activeResource = RESOURCE_LISTS.find((r) => r.id === openResourceId) ?? null;
  const activeCard = ALL_CARDS.find((c) => c.id === openResourceId) ?? null;
  const { selectedHousingTypeId, setSelectedHousingTypeId } = useFlow();

  return (
    <div className="space-y-6">
      <CardGroup heading="Find the duration that suits your needs">
        {DURATION_CARDS.map((card) => (
          <HousingCard
            key={card.id}
            card={card}
            isStudent={isStudent}
            onLearnMore={() => setOpenResourceId(card.id)}
          />
        ))}
      </CardGroup>

      <CardGroup heading="Find the type of housing that suits your needs">
        {HOUSING_TYPE_CARDS.filter((c) => !c.studentOnly || isStudent).map((card) => (
          <HousingCard
            key={card.id}
            card={card}
            isStudent={isStudent}
            selected={selectedHousingTypeId === card.id}
            onSelect={() =>
              setSelectedHousingTypeId(selectedHousingTypeId === card.id ? null : card.id)
            }
            onLearnMore={() => setOpenResourceId(card.id)}
          />
        ))}
      </CardGroup>

      {activeResource && activeCard && (
        <ResourceModal
          title={activeCard.title}
          resources={activeResource.resources}
          onClose={() => setOpenResourceId(null)}
        />
      )}
    </div>
  );
}
