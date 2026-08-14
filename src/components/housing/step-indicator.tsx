import { Check, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlow } from "./flow-state";

const STEPS = ["Your stage", "Where to look", "Search", "Verify", "Negotiate", "Apply"];

export function StepIndicator() {
  const { step, maxStep, goTo } = useFlow();

  return (
    <div className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto w-full max-w-3xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="size-4" aria-hidden />
            </span>
            <span className="font-display text-sm font-semibold">Housing Assistant</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            Stage {step} of 5 · {STEPS[step]}
          </span>
        </div>

        <ol className="mt-3 flex items-center gap-1.5" aria-label="Progress">
          {STEPS.map((label, i) => {
            const n = i;
            const done = n < step;
            const current = n === step;
            const reachable = n <= maxStep;
            return (
              <li key={label} className="flex-1">
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => goTo(n)}
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "group flex w-full flex-col items-start gap-1.5 rounded-md py-1 text-left transition-opacity",
                    reachable ? "cursor-pointer" : "cursor-not-allowed opacity-45",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-full rounded-full transition-colors",
                      current ? "bg-primary" : done ? "bg-primary/45" : "bg-border",
                    )}
                  />
                  <span
                    className={cn(
                      "hidden items-center gap-1 text-[11px] font-medium sm:flex",
                      current ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {done && <Check className="size-3" aria-hidden />}
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
