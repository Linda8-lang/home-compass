import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { COST_BREAKDOWN_ITEMS } from "@/data/housing-sections";
import { cn } from "@/lib/utils";

/** Generous, non-suggestive ranges — wide enough that no bound reads as a "typical" value. */
const SLIDER_MAX: Record<string, number> = {
  rent: 10000,
  utilities: 2000,
  internet: 2000,
  insurance: 2000,
  misc: 2000,
};

const CAD_FORMATTER = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

/**
 * Interactive, non-AI monthly cost calculator for the "Total Housing Costs" criterion
 * group. All fields start at 0 — this is a user-input tool, not a data display, so no
 * value here should ever be read as a typical or average figure.
 */
export function CostBreakdown() {
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(COST_BREAKDOWN_ITEMS.map((item) => [item.id, item.defaultValue])),
  );

  const total = useMemo(
    () => Object.values(values).reduce((sum, v) => sum + v, 0),
    [values],
  );

  return (
    <div className="surface space-y-4 p-4">
      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Calculator className="size-3.5 shrink-0 text-primary" aria-hidden />
        Monthly Cost Calculator
      </h4>

      <div className="space-y-4">
        {COST_BREAKDOWN_ITEMS.map((item) => {
          const Icon = item.icon;
          const value = values[item.id] ?? 0;
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          const max = SLIDER_MAX[item.id] ?? 2000;

          return (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Icon className="size-3.5 shrink-0 text-secondary-foreground" aria-hidden />
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {CAD_FORMATTER.format(value)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({pct}%)
                  </span>
                </span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/10">
                <div
                  className={cn("h-full rounded-full bg-primary transition-[width]")}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <Slider
                value={[value]}
                min={0}
                max={max}
                step={10}
                onValueChange={([v]) =>
                  setValues((prev) => ({ ...prev, [item.id]: v ?? 0 }))
                }
                aria-label={item.label}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border/60 pt-3">
        <span className="text-sm font-semibold text-foreground">Total (monthly)</span>
        <span className="text-base font-bold text-foreground">{CAD_FORMATTER.format(total)}</span>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        This is a personal calculator only — not an estimate of typical costs in any area.
      </p>
    </div>
  );
}
