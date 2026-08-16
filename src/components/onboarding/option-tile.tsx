import { cn } from "@/lib/utils";
import type { OnboardingOption } from "@/data/onboarding";

/**
 * A selectable card/tile: primary label + short supporting line. Styled to
 * match the existing `.surface` card pattern (see FIND_HOUSING_CATEGORIES
 * cards in column-two.tsx) combined with the aria-pressed selection styling
 * already used by the persona picker in column-one.tsx.
 */
export function OptionTile<T extends string>({
  option,
  selected,
  onSelect,
}: {
  option: OnboardingOption<T>;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "surface flex flex-col gap-1 p-4 text-left transition-colors",
        selected ? "border-primary bg-sand" : "hover:border-border hover:bg-sand/40",
      )}
    >
      <span className="text-base font-semibold text-foreground">{option.label}</span>
      <span className="text-sm leading-relaxed text-muted-foreground">{option.supporting}</span>
    </button>
  );
}
