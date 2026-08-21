import { useState } from "react";
import { BookMarked, ShieldCheck, AlertTriangle, X } from "lucide-react";
import type { DataSource, DataStatus } from "@/data/generated/neighbourhood-lookup";
import { cn } from "@/lib/utils";

const DATE_FORMAT = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const STATUS_COPY: Record<DataStatus, { label: string; tone: "verified" | "caution" }> = {
  ok: { label: "Up to date", tone: "verified" },
  stale: { label: "May be outdated", tone: "caution" },
  fallback_city_level: { label: "City-wide estimate", tone: "caution" },
};

/**
 * Freshness pill for one ingested data source, shared by the modal below and by
 * other data-citation call sites. Deliberately never uses text-destructive — none of these three states are an
 * error the user needs to be alarmed by, that token is reserved for scam warnings
 * and hard failures elsewhere in the app.
 */
export function DataStatusBadge({
  status,
  lastUpdated,
  className,
}: {
  status: DataStatus;
  lastUpdated: string;
  className?: string;
}) {
  const { label, tone } = STATUS_COPY[status];
  const Icon = tone === "verified" ? ShieldCheck : AlertTriangle;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "verified" ? "bg-verified-soft text-verified" : "bg-caution-soft text-caution",
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
      <span className="text-[11px] font-normal opacity-80">
        · {DATE_FORMAT.format(new Date(lastUpdated))}
      </span>
    </span>
  );
}

/**
 * Citation modal for one ingested data source (TPS crime data, CKAN rent data).
 * A sibling to SourceCite, not a variant of it — SourceCite reads the hand-authored
 * SOURCES/CITATIONS registry in src/data/sources.ts (whose modal footer says "these
 * source records are sample data, not live feeds", and whose `agreement` field
 * assumes multiple hand-authored sources per claim). Neither is true for the data
 * here: this is one real, machine-refreshed source per stat, so this component reads
 * source/status/lastUpdated straight from the ingested JSON via props instead.
 */
export function DataSourceCite({
  source,
  status,
  lastUpdated,
  label,
  className,
}: {
  source: DataSource;
  status: DataStatus;
  lastUpdated: string;
  label: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  let endpointHost = source.endpoint;
  try {
    endpointHost = new URL(source.endpoint).host;
  } catch {
    // endpoint wasn't a full URL (e.g. "(unconfigured)") — fall back to the raw string
  }

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
        Source
        <span className="sr-only"> — view source for {label}</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Source for ${label}`}
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
                <h3 className="text-base">{label}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close source"
                className="rounded-lg p-1 text-muted-foreground hover:bg-sand"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <DataStatusBadge status={status} lastUpdated={lastUpdated} className="mt-3" />

            <div className="mt-3 rounded-xl border border-border bg-background p-3">
              <a
                href={source.endpoint}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-foreground underline-offset-2 hover:underline"
              >
                {source.name}
              </a>
              <p className="mt-1 text-xs text-muted-foreground">{endpointHost}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Last refreshed {DATE_FORMAT.format(new Date(lastUpdated))}
              </p>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {source.disclaimer}
            </p>

            <p className="mt-4 text-xs text-muted-foreground">
              Refreshed periodically by an automated ingestion job, not real-time.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
