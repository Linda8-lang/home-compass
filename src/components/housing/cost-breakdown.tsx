'use client';

import { useState } from "react";
import { COST_BREAKDOWN_ITEMS } from "@/data/housing-sections";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const CURRENCY_FORMAT = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

export function CostBreakdown() {
  const [rent, setRent] = useState(2000);

  const items = COST_BREAKDOWN_ITEMS.map((item) => ({
    ...item,
    amount: item.label === "Rent (Base)" ? rent : item.default,
  }));

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  const handleRentChange = (newRent: number) => {
    setRent(newRent);
    // Track event if gtag is available
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "cost_breakdown_rent_adjusted", {
        new_rent: newRent,
        total_monthly: total,
      });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-gradient-to-br from-sand/30 to-transparent p-4 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Your Estimated Monthly Cost
      </h3>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          const pct = total > 0 ? ((item.amount / total) * 100).toFixed(0) : "0";

          return (
            <div key={item.label} className="space-y-1.5">
              {/* Label and amount */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  {item.label}
                </span>
                <span className="text-muted-foreground">
                  {CURRENCY_FORMAT.format(item.amount)} ({pct}%)
                </span>
              </div>

              {/* Visual progress bar */}
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${(item.amount / total) * 100}%` }}
                  aria-hidden
                />
              </div>

              {/* Rent slider - only show for variable items */}
              {item.isVariable && (
                <div className="pt-1">
                  <Slider
                    value={[rent]}
                    onValueChange={(v) => handleRentChange(v[0])}
                    min={800}
                    max={4000}
                    step={50}
                    className="mt-1"
                    aria-label="Adjust base rent amount"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>$800</span>
                    <span>$4,000</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total section */}
      <div className="border-t border-border pt-3 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-foreground">Total Monthly</span>
          <span className="text-lg font-bold text-primary">
            {CURRENCY_FORMAT.format(total)}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          This is your baseline estimate. Actual costs vary by building, utilities included in
          rent, and personal choices. Adjust the rent slider above to see how changes affect your
          total.
        </p>
      </div>
    </div>
  );
}
