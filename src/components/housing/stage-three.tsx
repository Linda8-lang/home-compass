import { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Search,
  Footprints,
  TrendingDown,
  TrendingUp,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FACT_SHEETS, NEIGHBORHOODS, type FactSheet } from "@/data/mock";
import { cn } from "@/lib/utils";
import { SourceCite } from "./source-cite";
import { useFlow } from "./flow-state";
import { StageHeader, VerifiedBadge, LearnMore } from "./primitives";

const toneClass: Record<string, string> = {
  good: "text-verified",
  fair: "text-caution",
  watch: "text-destructive",
};

export function StageThree() {
  const { advance, setVerifiedAddress, verifiedAddress, setChosenListing } = useFlow();
  const [query, setQuery] = useState(verifiedAddress ?? "");
  const [sheet, setSheet] = useState<FactSheet | null>(
    FACT_SHEETS.find((f) => f.address === verifiedAddress) ?? null,
  );
  const [notFound, setNotFound] = useState(false);

  function run(address: string) {
    const match =
      FACT_SHEETS.find((f) => f.address.toLowerCase() === address.trim().toLowerCase()) ??
      FACT_SHEETS.find((f) =>
        f.address.toLowerCase().includes(address.trim().toLowerCase().slice(0, 6)),
      );
    if (!match || address.trim().length < 3) {
      setSheet(null);
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setQuery(match.address);
    setSheet(match);
    setVerifiedAddress(match.address);
  }

  const hood = sheet ? NEIGHBORHOODS.find((n) => n.id === sheet.neighborhoodId) : null;
  const under = sheet ? sheet.listedRent < sheet.rents.comparable : false;

  return (
    <div className="space-y-8">
      <StageHeader
        eyebrow="Stage 3 · Verification"
        title="Is this address what the listing claims?"
        intro="Paste an address for a short verified summary. Open a section for the detail behind it."
      />

      <section className="warm-gradient rounded-2xl border border-border p-5 shadow-soft sm:p-7">
        <VerifiedBadge label="Data-verified report" />
        <h2 className="mt-3 text-xl leading-snug sm:text-2xl">Paste a listing address</h2>
        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            run(query);
          }}
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="412 Palmerston Blvd, Unit 2"
              aria-label="Listing address"
              className="h-12 bg-card pl-9 text-base"
            />
          </div>
          <Button type="submit" size="lg" className="h-12">
            Verify
          </Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">Or try a sample address:</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {FACT_SHEETS.map((f) => (
            <button
              key={f.address}
              type="button"
              onClick={() => run(f.address)}
              className="rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-secondary-foreground hover:bg-card"
            >
              {f.address}
            </button>
          ))}
        </div>
        {notFound && (
          <p className="mt-3 flex items-center gap-2 text-sm text-caution">
            <Info className="size-4" aria-hidden />
            No sample report for that address — try one of the sample listings above.
          </p>
        )}
      </section>

      {sheet && (
        <section className="space-y-3">
          <div className="surface overflow-hidden">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-verified-soft/50 p-4">
              <div>
                <h2 className="text-base">{sheet.address}</h2>
                <p className="text-sm text-muted-foreground">
                  {hood?.name} · listed at ${sheet.listedRent.toLocaleString()}/mo
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-xl bg-verified px-3 py-2 text-sm font-semibold text-verified-foreground">
                <ShieldCheck className="size-4" aria-hidden />
                Data-verified
              </span>
            </header>

            <div className="divide-y divide-border">
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Safety
                  </h3>
                  <span className="flex items-center gap-2">
                    <VerifiedBadge label="Police open data" />
                    <SourceCite metric="safetyScore" compact />
                  </span>
                </div>
                <p
                  className={cn("font-display text-lg font-semibold", toneClass[sheet.safety.tone])}
                >
                  {sheet.safety.rating}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">{sheet.safety.note}</p>
              </div>

              <div className="p-4">
                <LearnMore
                  label={`Nearby rents · $${sheet.rents.comparable.toLocaleString()} average (${sheet.rents.delta})`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <VerifiedBadge label="Closed-lease records" />
                    <SourceCite metric="listedRentDelta" compact />
                  </div>
                  <p className="flex items-center gap-2 font-display text-lg font-semibold">
                    {under ? (
                      <TrendingDown className="size-5 text-verified" aria-hidden />
                    ) : (
                      <TrendingUp className="size-5 text-caution" aria-hidden />
                    )}
                    ${sheet.rents.comparable.toLocaleString()} average ·{" "}
                    <span className={under ? "text-verified" : "text-caution"}>
                      {sheet.rents.delta}
                    </span>
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {sheet.rents.note}
                  </p>
                </LearnMore>
              </div>

              <div className="p-4">
                <LearnMore label={`Groceries & essentials · ${sheet.essentials.length} nearby`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <VerifiedBadge label="Mapped on foot" />
                    <SourceCite metric="essentials" compact />
                  </div>
                  <ul className="divide-y divide-border/70">
                    {sheet.essentials.map((e) => (
                      <li key={e.name} className="flex items-center justify-between gap-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{e.name}</p>
                          <p className="text-xs text-muted-foreground">{e.kind}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-secondary-foreground">
                          <Footprints className="size-3.5" aria-hidden />
                          {e.walk}
                        </span>
                      </li>
                    ))}
                  </ul>
                </LearnMore>
              </div>
            </div>

            <p className="bg-sand px-4 py-2 text-xs text-muted-foreground">{sheet.updated}</p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              const listingId =
                sheet.address === "88 Pacific Ave, Unit 5"
                  ? "l2"
                  : sheet.address === "255 Danforth Ave, Unit 704"
                    ? "l3"
                    : "l1";
              setChosenListing(listingId);
              advance(4);
            }}
          >
            Ask the advisor to coach my reply
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </section>
      )}
    </div>
  );
}
