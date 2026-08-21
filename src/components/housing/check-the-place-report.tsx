import { Component, useState, type ReactNode } from "react";
import {
  Search,
  MapPin,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Info,
  BookMarked,
} from "lucide-react";
import {
  matchNeighbourhoodByText,
  CITYWIDE_OFFENCE_RATES,
  CKAN_RENT_RANGE,
  CMHC_META,
  CMHC_CITYWIDE_RANGE,
  SAFETY_META,
  RENT_META,
  type NeighbourhoodSnapshot,
  type OffenceStat,
} from "@/data/generated/neighbourhood-lookup";
import { useFlow } from "./flow-state";
import { DataSourceCite, DataStatusBadge } from "./data-source-cite";
import { VerifiedBadge } from "./primitives";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const CRIME_TABLE_ROWS: { key: string; label: string }[] = [
  { key: "assault", label: "Assault" },
  { key: "break_enter", label: "Break & Enter" },
  { key: "robbery", label: "Robbery" },
  { key: "auto_theft", label: "Auto Theft" },
  { key: "theft_from_motor_vehicle", label: "Theft from Vehicle" },
];

const EXAMPLE_ADDRESSES = [
  "1200 Bloor St W, Dovercourt Village, Toronto",
  "10 St Clair Ave W, Yonge-St.Clair, Toronto",
];

const CURRENCY_FORMAT = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number | null | undefined): string {
  return value == null ? "Not available" : CURRENCY_FORMAT.format(value);
}

function formatRate(value: number | null | undefined): string {
  return value == null ? "—" : `${value.toFixed(1)} / 100k`;
}

/** Reusable min–max bar with an optional marker for one real value inside a real range. */
function RangeBar({
  min,
  max,
  marker,
  markerLabel,
}: {
  min: number;
  max: number;
  marker?: number;
  markerLabel?: string;
}) {
  const pct =
    marker != null && max > min
      ? Math.min(100, Math.max(0, ((marker - min) / (max - min)) * 100))
      : null;
  return (
    <div className="space-y-1.5">
      <div className="relative h-2 rounded-full bg-sand">
        {pct != null && (
          <div
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-sm"
            style={{ left: `${pct}%` }}
            title={markerLabel}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Min {formatCurrency(min)}</span>
        {markerLabel && <span className="font-medium text-foreground">{markerLabel}</span>}
        <span>Max {formatCurrency(max)}</span>
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

/**
 * Static-lane only, same as NeighbourhoodSnapshotWidget — reads the promoted TPS/CKAN
 * (and, once populated, CMHC) JSON directly and must never be threaded into
 * src/routes/api/advisor.ts's context.
 *
 * There is no geocoding pipeline in this app (see matchNeighbourhoodByText's doc
 * comment), so "address" here resolves only when the typed text contains a known
 * Toronto neighbourhood name — it is not a street-level lookup.
 */
function CheckThePlaceReportInner() {
  const { filters } = useFlow();
  const [addressInput, setAddressInput] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const [comparisonPrice, setComparisonPrice] = useState(filters.budget);

  function checkListing(raw: string) {
    const cleaned = raw.replace(/\s+/g, " ").trim().slice(0, 200);
    if (!cleaned) return;
    setAddressInput(cleaned);
    setQuery(cleaned);
  }

  const match: NeighbourhoodSnapshot | null = query ? matchNeighbourhoodByText(query) : null;

  return (
    <div className="surface space-y-5 p-4">
      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-secondary-foreground">
          <Search className="size-3.5 shrink-0 text-primary" aria-hidden />
          Check the Place
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Type an address to see reported crime and rent figures for its neighbourhood — matched by
          neighbourhood name, not a street-level lookup, and never a recommendation.
        </p>
      </div>

      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          checkListing(addressInput);
        }}
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="e.g. 1200 Bloor St W, Dovercourt Village, Toronto"
            aria-label="Address to check"
            maxLength={200}
          />
          <Button type="submit" disabled={!addressInput.trim()} className="shrink-0">
            Check Listing
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_ADDRESSES.map((addr) => (
            <button
              key={addr}
              type="button"
              onClick={() => checkListing(addr)}
              className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {addr}
            </button>
          ))}
        </div>
      </form>

      {query && !match && (
        <EmptyState>
          Not enough data for this area — "{query}" doesn't match a Toronto neighbourhood we have
          crime or rent data for. Try including the neighbourhood name, or one of the examples
          above.
        </EmptyState>
      )}

      {match && (
        <div className="space-y-5">
          {/* 3. Address confirmation */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/70 p-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-medium text-foreground">{query}</p>
                <p className="text-xs text-muted-foreground">Matched to {match.areaName}</p>
              </div>
            </div>
            <VerifiedBadge label="Neighbourhood matched" />
          </div>

          {/* 4. Rent verdict */}
          <RentVerdict
            match={match}
            comparisonPrice={comparisonPrice}
            onComparisonPriceChange={setComparisonPrice}
          />

          {/* 5. Crime comparison table */}
          <CrimeTable match={match} />

          {/* 6. How to read this */}
          <HowToReadThis />

          {/* 7. Nearby rents */}
          <NearbyRents match={match} />
        </div>
      )}
    </div>
  );
}

function RentVerdict({
  match,
  comparisonPrice,
  onComparisonPriceChange,
}: {
  match: NeighbourhoodSnapshot;
  comparisonPrice: number;
  onComparisonPriceChange: (value: number) => void;
}) {
  const avgRent = match.rent?.median_renter_shelter_cost ?? null;

  return (
    <div className="rounded-lg border border-border/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
          Budget vs. Neighbourhood Rent
        </h4>
        <DataSourceCite
          source={RENT_META.source}
          status={RENT_META.status}
          lastUpdated={RENT_META.lastUpdated}
          label="Neighbourhood rent"
        />
      </div>

      <label className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        Your monthly budget for this check
        <Input
          type="number"
          min={0}
          step={50}
          value={comparisonPrice}
          onChange={(e) => onComparisonPriceChange(Number(e.target.value) || 0)}
          className="h-7 w-28"
          aria-label="Comparison price for this address"
        />
      </label>

      {avgRent == null ? (
        <EmptyState>
          No 2021 Census rent figure for this neighbourhood — nothing to compare.
        </EmptyState>
      ) : (
        <RentVerdictLine comparisonPrice={comparisonPrice} avgRent={avgRent} />
      )}
    </div>
  );
}

function RentVerdictLine({
  comparisonPrice,
  avgRent,
}: {
  comparisonPrice: number;
  avgRent: number;
}) {
  const diffPct = ((comparisonPrice - avgRent) / avgRent) * 100;
  const verdict = diffPct > 10 ? "above" : diffPct < -10 ? "below" : "near";
  const tone =
    verdict === "below" ? "text-caution" : verdict === "above" ? "text-verified" : "text-verified";
  const Icon = verdict === "above" ? TrendingUp : verdict === "below" ? TrendingDown : Minus;
  const verdictCopy =
    verdict === "above"
      ? "comfortably above"
      : verdict === "below"
        ? "below — this neighbourhood's typical rent may be a stretch"
        : "close to";

  return (
    <div className="space-y-1">
      <p className={cn("flex items-center gap-1.5 text-sm font-semibold", tone)}>
        <Icon className="size-4 shrink-0" aria-hidden />
        Your budget is {verdictCopy} the neighbourhood average
      </p>
      <p className="text-xs text-muted-foreground">
        Neighbourhood avg rent {formatCurrency(avgRent)} · {formatCurrency(comparisonPrice)} vs avg
        ({diffPct > 0 ? "+" : ""}
        {diffPct.toFixed(0)}%)
      </p>
    </div>
  );
}

function CrimeTable({ match }: { match: NeighbourhoodSnapshot }) {
  const safety = match.safety;

  return (
    <div className="rounded-lg border border-border/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
          <ShieldCheck className="size-3.5 shrink-0 text-primary" aria-hidden />
          Crime Comparison
        </h4>
        <DataSourceCite
          source={SAFETY_META.source}
          status={SAFETY_META.status}
          lastUpdated={SAFETY_META.lastUpdated}
          label="Reported crime"
        />
      </div>
      <DataStatusBadge
        status={SAFETY_META.status}
        lastUpdated={SAFETY_META.lastUpdated}
        className="mb-2"
      />

      {!safety ? (
        <EmptyState>No TPS crime data for this neighbourhood.</EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Offence</TableHead>
              <TableHead>This Neighbourhood</TableHead>
              <TableHead>Toronto Average</TableHead>
              <TableHead>Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CRIME_TABLE_ROWS.map(({ key, label }) => {
              const stat: OffenceStat | undefined = safety.offences[key];
              const cityRate = CITYWIDE_OFFENCE_RATES[key];
              const rate = stat?.rate_per_100k ?? null;
              const diffPct =
                rate != null && cityRate ? ((rate - cityRate) / cityRate) * 100 : null;
              const tone =
                diffPct == null
                  ? "text-muted-foreground"
                  : diffPct > 5
                    ? "text-caution"
                    : diffPct < -5
                      ? "text-verified"
                      : "text-muted-foreground";
              return (
                <TableRow key={key}>
                  <TableCell className="font-medium text-foreground">{label}</TableCell>
                  <TableCell>{formatRate(rate)}</TableCell>
                  <TableCell>{formatRate(cityRate)}</TableCell>
                  <TableCell className={cn("font-medium", tone)}>
                    {diffPct == null ? "—" : `${diffPct > 0 ? "+" : ""}${diffPct.toFixed(0)}%`}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">
        {SAFETY_META.source.name} · last updated{" "}
        {new Intl.DateTimeFormat("en-CA", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }).format(new Date(SAFETY_META.lastUpdated))}
      </p>
    </div>
  );
}

function HowToReadThis() {
  return (
    <div className="rounded-lg border border-border/70 bg-sand/40 p-3">
      <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
        <Info className="size-3.5 shrink-0" aria-hidden />
        How to read this
      </h4>
      <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
        <li>These figures describe the neighbourhood, not this specific building or unit.</li>
        <li>
          Reported crime reflects occurrences, not convictions, and moves with broader urban trends.
        </li>
        <li>
          A single number is not a red or green flag by itself — compare it against the Toronto
          average and use it alongside a live viewing, not instead of one.
        </li>
      </ul>
    </div>
  );
}

function NearbyRents({ match }: { match: NeighbourhoodSnapshot }) {
  const rent = match.rent;
  const medianRent = rent?.median_renter_shelter_cost ?? null;

  return (
    <div className="rounded-lg border border-border/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
          Nearby Rents
        </h4>
        <DataSourceCite
          source={RENT_META.source}
          status={RENT_META.status}
          lastUpdated={RENT_META.lastUpdated}
          label="Neighbourhood rent"
        />
      </div>

      {medianRent == null || !CKAN_RENT_RANGE ? (
        <EmptyState>No 2021 Census rent figure for this neighbourhood.</EmptyState>
      ) : (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            2021 Census median shelter cost (all unit types) vs. the range across all Toronto
            neighbourhoods
          </p>
          <RangeBar
            min={CKAN_RENT_RANGE.min}
            max={CKAN_RENT_RANGE.max}
            marker={medianRent}
            markerLabel={`This neighbourhood ${formatCurrency(medianRent)}`}
          />
        </div>
      )}

      <div className="mt-3 border-t border-border/60 pt-3">
        {!CMHC_META ? (
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
            title="The CMHC annual rental market baseline isn't wired up yet."
          >
            <BookMarked className="size-3.5" aria-hidden />
            City-wide CMHC 1BR/2BR baseline — not yet available
          </span>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                CMHC city-wide range (not neighbourhood-specific)
              </p>
              <DataStatusBadge status={CMHC_META.status} lastUpdated={CMHC_META.lastUpdated} />
            </div>
            {CMHC_CITYWIDE_RANGE.oneBed && (
              <div>
                <p className="text-[11px] font-medium text-foreground">1BR</p>
                <RangeBar
                  min={CMHC_CITYWIDE_RANGE.oneBed.min}
                  max={CMHC_CITYWIDE_RANGE.oneBed.max}
                />
              </div>
            )}
            {CMHC_CITYWIDE_RANGE.twoBed && (
              <div>
                <p className="text-[11px] font-medium text-foreground">2BR</p>
                <RangeBar
                  min={CMHC_CITYWIDE_RANGE.twoBed.min}
                  max={CMHC_CITYWIDE_RANGE.twoBed.max}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

class ReportErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  override state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: unknown) {
    console.error(error);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="surface flex items-start gap-2 p-4 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-caution" aria-hidden />
          <span>
            Something went wrong loading "Check the Place." The rest of the page is unaffected — try
            refreshing, or check a different address.
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

export function CheckThePlaceReport() {
  return (
    <ReportErrorBoundary>
      <CheckThePlaceReportInner />
    </ReportErrorBoundary>
  );
}
