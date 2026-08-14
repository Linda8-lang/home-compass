import { useState } from "react";
import { BookMarked, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { CITATIONS, SOURCES } from "@/data/sources";
import { cn } from "@/lib/utils";

const agreementTone: Record<string, string> = {
  "Sources agree": "text-verified",
  "Minor variance": "text-caution",
  "Sources disagree": "text-destructive",
};

export function SourceCite({
  metric,
  className,
  compact,
}: {
  metric: keyof typeof CITATIONS | string;
  className?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const citation = CITATIONS[metric];
  if (!citation) return null;
  const sources = citation.sourceIds.map((id) => SOURCES[id]).filter(Boolean);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-verified-soft px-2.5 py-1 text-xs font-semibold text-verified transition-opacity hover:opacity-80",
          className,
        )}
      >
        <BookMarked className="size-3.5" aria-hidden />
        {compact ? sources.length : `${sources.length} sources`}
        <span className="sr-only"> — view sources for {citation.label}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Sources for ${citation.label}`}
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-border bg-card p-4 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Where this comes from
                </p>
                <h3 className="text-base">{citation.label}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close sources"
                className="rounded-lg p-1 text-muted-foreground hover:bg-sand"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <p
              className={cn(
                "mt-3 flex items-center gap-1.5 text-sm font-semibold",
                agreementTone[citation.agreement],
              )}
            >
              {citation.agreement === "Sources agree" ? (
                <CheckCircle2 className="size-4" aria-hidden />
              ) : (
                <AlertTriangle className="size-4" aria-hidden />
              )}
              {citation.agreement}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{citation.note}</p>

            <ul className="mt-4 space-y-2">
              {sources.map((s) => (
                <li key={s.id} className="rounded-xl border border-border bg-background p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <span className="shrink-0 rounded-full bg-sand px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                      {s.kind}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.org}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Last refreshed {s.updated} · {s.cadence}
                  </p>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-xs text-muted-foreground">
              Prototype note: these source records are sample data, not live feeds.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
