import { Component, useEffect, useState, type ReactNode } from "react";
import { Search, MapPin, ShieldCheck, AlertTriangle, Info, Bookmark, X } from "lucide-react";
import {
  matchNeighbourhoodByText,
  CITYWIDE_OFFENCE_RATES,
  type NeighbourhoodSnapshot,
  type OffenceStat,
} from "@/data/generated/neighbourhood-lookup";
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

const SAVED_PLACES_STORAGE_KEY = "home-compass:check-the-place-saved";

type SavedPlace = { query: string; hoodId: number; areaName: string; savedAt: number };

function readStoredSavedPlaces(): SavedPlace[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_PLACES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedPlace[]) : [];
  } catch {
    return [];
  }
}

function formatRate(value: number | null | undefined): string {
  return value == null ? "—" : `${value.toFixed(1)} / 100k`;
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
 * Static-lane only — reads the promoted TPS/CKAN
 * (and, once populated, CMHC) JSON directly and must never be threaded into
 * src/routes/api/advisor.ts's context.
 *
 * There is no geocoding pipeline in this app (see matchNeighbourhoodByText's doc
 * comment), so "address" here resolves only when the typed text contains a known
 * Toronto neighbourhood name — it is not a street-level lookup.
 *
 * Saved places are kept in their own localStorage key, scoped to this component —
 * not lifted into FlowProvider — so they stay out of advisorAppContext and the
 * two-lane boundary documented there holds.
 */
function CheckThePlaceReportInner() {
  const [addressInput, setAddressInput] = useState("");
  const [query, setQuery] = useState<string | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(() => readStoredSavedPlaces());

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_PLACES_STORAGE_KEY, JSON.stringify(savedPlaces));
    } catch {
      // localStorage unavailable (private mode, disabled storage, etc.) — state still works in-memory.
    }
  }, [savedPlaces]);

  function checkListing(raw: string) {
    const cleaned = raw.replace(/\s+/g, " ").trim().slice(0, 200);
    if (!cleaned) return;
    setAddressInput(cleaned);
    setQuery(cleaned);
  }

  const match: NeighbourhoodSnapshot | null = query ? matchNeighbourhoodByText(query) : null;
  const isSaved = Boolean(match && savedPlaces.some((p) => p.hoodId === match.hoodId));

  function toggleSave() {
    if (!match || !query) return;
    setSavedPlaces((prev) => {
      if (prev.some((p) => p.hoodId === match.hoodId)) {
        return prev.filter((p) => p.hoodId !== match.hoodId);
      }
      return [
        { query, hoodId: match.hoodId, areaName: match.areaName, savedAt: Date.now() },
        ...prev,
      ];
    });
  }

  function removeSaved(hoodId: number) {
    setSavedPlaces((prev) => prev.filter((p) => p.hoodId !== hoodId));
  }

  return (
    <div className="surface space-y-5 p-4">
      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-secondary-foreground">
          <Search className="size-3.5 shrink-0 text-primary" aria-hidden />
          Check the Place
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Type your address</p>
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

      {savedPlaces.length > 0 && (
        <SavedPlacesList
          places={savedPlaces}
          onSelect={(p) => checkListing(p.query)}
          onRemove={removeSaved}
        />
      )}

      {query && !match && (
        <EmptyState>
          Not enough data for this area — "{query}" doesn't match a Toronto neighbourhood we have
          crime data for. Try including the neighbourhood name, or one of the examples above.
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
            <div className="flex items-center gap-2">
              <VerifiedBadge label="Neighbourhood matched" />
              <Button
                type="button"
                variant={isSaved ? "secondary" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={toggleSave}
                aria-pressed={isSaved}
              >
                <Bookmark className={cn("size-3.5", isSaved && "fill-current")} aria-hidden />
                {isSaved ? "Saved" : "Save this place"}
              </Button>
            </div>
          </div>

          {/* 4. Crime comparison table */}
          <CrimeTable match={match} />

          {/* 5. How to read this */}
          <HowToReadThis />
        </div>
      )}
    </div>
  );
}

function SavedPlacesList({
  places,
  onSelect,
  onRemove,
}: {
  places: SavedPlace[];
  onSelect: (place: SavedPlace) => void;
  onRemove: (hoodId: number) => void;
}) {
  return (
    <div className="rounded-lg border border-border/70 p-3">
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
        <Bookmark className="size-3.5 shrink-0 text-primary" aria-hidden />
        Saved Places
      </h4>
      <ul className="space-y-1.5">
        {places.map((p) => (
          <li
            key={p.hoodId}
            className="flex items-center justify-between gap-2 rounded-md border border-border/50 px-2.5 py-1.5 text-xs"
          >
            <button
              type="button"
              onClick={() => onSelect(p)}
              className="min-w-0 flex-1 truncate text-left text-foreground hover:text-primary"
              title={p.query}
            >
              {p.query}
            </button>
            <button
              type="button"
              onClick={() => onRemove(p.hoodId)}
              aria-label={`Remove ${p.query} from saved places`}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CrimeTable({ match }: { match: NeighbourhoodSnapshot }) {
  const safety = match.safety;

  return (
    <div className="rounded-lg border border-border/70 p-3">
      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
        <ShieldCheck className="size-3.5 shrink-0 text-primary" aria-hidden />
        Crime Comparison
      </h4>

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
