import { useState } from "react";
import { MapPin, ChevronsUpDown, ShieldCheck, Wallet, BookMarked } from "lucide-react";
import {
  NEIGHBOURHOOD_SNAPSHOTS,
  NEIGHBOURHOOD_BY_ID,
  SAFETY_META,
  RENT_META,
  type OffenceStat,
} from "@/data/generated/neighbourhood-lookup";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { DataSourceCite, DataStatusBadge } from "./data-source-cite";
import { cn } from "@/lib/utils";

const OFFENCE_ROWS: { key: string; label: string }[] = [
  { key: "assault", label: "Assault" },
  { key: "auto_theft", label: "Auto Theft" },
  { key: "bike_theft", label: "Bike Theft" },
  { key: "break_enter", label: "Break & Enter" },
  { key: "homicide", label: "Homicide" },
  { key: "robbery", label: "Robbery" },
  { key: "shooting", label: "Shooting" },
  { key: "theft_over", label: "Theft Over" },
  { key: "theft_from_motor_vehicle", label: "Theft from Vehicle" },
];

const CURRENCY_FORMAT = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

function formatOffenceRate(stat: OffenceStat | undefined): string {
  if (!stat || stat.rate_per_100k == null) return "—";
  return `${stat.rate_per_100k.toFixed(1)} / 100k`;
}

function formatCurrency(value: number | null | undefined): string {
  return value == null ? "Not available" : CURRENCY_FORMAT.format(value);
}

/**
 * Static-lane only — this data must never be threaded into
 * src/routes/api/advisor.ts's context. Raw stat values only: no synthesized
 * safety score, no colour-coded rating — matches this section's existing
 * "no risk ratings" principle.
 */
export function NeighbourhoodSnapshotWidget() {
  const [open, setOpen] = useState(false);
  const [hoodId, setHoodId] = useState<number | null>(null);

  const selected = hoodId != null ? NEIGHBOURHOOD_BY_ID.get(hoodId) : undefined;
  const safety = selected?.safety ?? null;
  const rent = selected?.rent ?? null;

  return (
    <div className="surface space-y-4 p-4">
      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-secondary-foreground">
          <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden />
          Neighbourhood Snapshot
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Reported crime and 2021 census rent figures for a Toronto neighbourhood — not a score, not
          a recommendation.
        </p>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm text-foreground"
          >
            <span className={cn(!selected && "text-muted-foreground")}>
              {selected ? selected.areaName : "Search a Toronto neighbourhood…"}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] max-w-[90vw] p-0" align="start">
          <Command>
            <CommandInput placeholder="Type a neighbourhood name…" />
            <CommandList>
              <CommandEmpty>No neighbourhood matches that search.</CommandEmpty>
              {NEIGHBOURHOOD_SNAPSHOTS.map((n) => (
                <CommandItem
                  key={n.hoodId}
                  value={n.areaName}
                  onSelect={() => {
                    setHoodId(n.hoodId);
                    setOpen(false);
                  }}
                >
                  {n.areaName}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/70 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                <ShieldCheck className="size-3.5 shrink-0 text-primary" aria-hidden />
                Reported Crime
              </h4>
              <DataSourceCite
                source={SAFETY_META.source}
                status={SAFETY_META.status}
                lastUpdated={SAFETY_META.lastUpdated}
                label="Reported crime"
              />
            </div>
            <DataStatusBadge status={SAFETY_META.status} lastUpdated={SAFETY_META.lastUpdated} />
            {SAFETY_META.status === "fallback_city_level" && (
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Neighbourhood-level data unavailable; showing citywide figures instead.
              </p>
            )}
            {safety ? (
              <ul className="mt-2 space-y-1.5 text-xs">
                {safety.population != null && (
                  <li className="flex justify-between text-muted-foreground">
                    <span>Population</span>
                    <span className="font-medium text-foreground">
                      {safety.population.toLocaleString("en-CA")}
                    </span>
                  </li>
                )}
                {OFFENCE_ROWS.map(({ key, label }) => (
                  <li key={key} className="flex justify-between text-muted-foreground">
                    <span>{label}</span>
                    <span className="font-medium text-foreground">
                      {formatOffenceRate(safety.offences[key])}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Not available for this neighbourhood.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-border/70 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                <Wallet className="size-3.5 shrink-0 text-primary" aria-hidden />
                Housing Cost (2021 Census)
              </h4>
              <DataSourceCite
                source={RENT_META.source}
                status={RENT_META.status}
                lastUpdated={RENT_META.lastUpdated}
                label="Housing cost"
              />
            </div>
            <DataStatusBadge status={RENT_META.status} lastUpdated={RENT_META.lastUpdated} />
            {RENT_META.status === "fallback_city_level" && (
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Neighbourhood-level data unavailable; showing citywide figures instead.
              </p>
            )}
            {rent ? (
              <ul className="mt-2 space-y-1.5 text-xs">
                <li className="flex justify-between text-muted-foreground">
                  <span>Median rent (tenant)</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(rent.median_renter_shelter_cost)}
                  </span>
                </li>
                <li className="flex justify-between text-muted-foreground">
                  <span>Median shelter cost (owner)</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(rent.median_owner_shelter_cost)}
                  </span>
                </li>
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                Not available for this neighbourhood.
              </p>
            )}
            <span
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              title="The CMHC annual rental market baseline isn't wired up yet."
            >
              <BookMarked className="size-3.5" aria-hidden />
              City-wide CMHC rent baseline — not yet available
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
