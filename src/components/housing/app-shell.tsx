import { Home } from "lucide-react";
import { ColumnOne } from "./column-one";
import { ColumnTwo } from "./column-two";
import { AdvisorPanel } from "./advisor-chat";

/**
 * Strict 3-column layout:
 *   1. Categories / index / navigation
 *   2. Static Reference Lane (factual guides, checklists)
 *   3. AI Advisor — docked, persistent, never a bubble or a fullscreen takeover
 */
export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 h-14 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-full w-full max-w-[1400px] items-center gap-3 px-4">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Home className="size-4" aria-hidden />
          </span>
          <span className="font-display text-sm font-semibold">Housing Assistant</span>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
            Reference guide · AI Advisor
          </span>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[210px_minmax(0,1fr)_380px] lg:items-start">
        <ColumnOne />
        <ColumnTwo />
        <AdvisorPanel />
      </div>
    </div>
  );
}
