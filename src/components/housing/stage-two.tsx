import { useMemo, useState } from "react";
import {
  ArrowRight,
  Train,
  ShieldCheck,
  Timer,
  Plus,
  Check,
  Scale,
  X,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NEIGHBORHOODS } from "@/data/mock";
import { cn } from "@/lib/utils";
import { SourceCite } from "./source-cite";
import { useFlow, type TransitPref } from "./flow-state";
import { ScoreTag, SectionTitle, StageHeader } from "./primitives";

const TRANSIT_OPTIONS: { id: TransitPref; label: string }[] = [
  { id: "subway", label: "Need subway access" },
  { id: "car", label: "Car is okay" },
  { id: "walk", label: "Walk to work/school" },
];

const STATUS_OPTIONS = [
  { id: "student", label: "Student" },
  { id: "job-offer", label: "Job offer" },
  { id: "other", label: "Other" },
] as const;

export function StageTwo() {
  const {
    filters,
    setFilters,
    searched,
    setSearched,
    compare,
    toggleCompare,
    chosenNeighborhood,
    setChosenNeighborhood,
    advance,
  } = useFlow();
  const [draft, setDraft] = useState(filters);
  const [compareOpen, setCompareOpen] = useState(false);

  const ranked = useMemo(() => {
    return [...NEIGHBORHOODS]
      .map((n) => {
        let score = 0;
        if (n.rentLow <= filters.budget) score += 40;
        if (n.rentHigh <= filters.budget) score += 20;
        if (filters.transit === "subway") score += n.transitScore / 3;
        if (filters.transit === "walk") score += Math.max(0, 40 - n.commuteMins);
        if (filters.transit === "car") score += n.safetyScore / 3;
        score += (100 - n.commuteMins) / 8;
        return { ...n, score };
      })
      .sort((a, b) => b.score - a.score);
  }, [filters]);

  const compared = ranked.filter((n) => compare.includes(n.id));

  return (
    <div className="space-y-8 pb-24">
      <StageHeader
        eyebrow="Stage 2 · Search & filter"
        title="Narrow Toronto down to the two or three neighbourhoods worth your time."
        intro="Ranked on your budget, your commute and how much you'll depend on transit."
      />

      <form
        className="surface space-y-5 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          setFilters(draft);
          setSearched(true);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="city">Target city</Label>
            <Input id="city" value={draft.city} readOnly className="bg-muted" />
            <p className="text-xs text-muted-foreground">Toronto only in this prototype.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dest">Work or school location</Label>
            <Input
              id="dest"
              value={draft.destination}
              onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
              placeholder="e.g. University of Toronto"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="budget">Max monthly budget</Label>
            <span className="font-display text-lg font-semibold">
              ${draft.budget.toLocaleString()}
            </span>
          </div>
          <Slider
            id="budget"
            min={1200}
            max={3000}
            step={50}
            value={[draft.budget]}
            onValueChange={(v) => setDraft({ ...draft, budget: v[0] ?? draft.budget })}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Transit dependency</legend>
          <div className="flex flex-wrap gap-2">
            {TRANSIT_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setDraft({ ...draft, transit: o.id })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  draft.transit === o.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-secondary-foreground hover:bg-secondary",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Why you're moving</legend>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setDraft({ ...draft, status: o.id })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  draft.status === o.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-secondary-foreground hover:bg-secondary",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            We reuse this in Stage 4 and 5 — you won't be asked again.
          </p>
        </fieldset>

        <Button type="submit" className="w-full sm:w-auto">
          <Search className="size-4" aria-hidden />
          {searched ? "Update results" : "Show neighbourhoods"}
        </Button>
      </form>

      {searched && (
        <section className="space-y-3">
          <SectionTitle
            aside={
              <span className="text-xs text-muted-foreground">
                {ranked.length} matches · sample data
              </span>
            }
          >
            Ranked for you
          </SectionTitle>

          <div className="space-y-3">
            {ranked.map((n, i) => {
              const inCompare = compare.includes(n.id);
              const picked = chosenNeighborhood === n.id;
              const overBudget = n.rentLow > filters.budget;
              return (
                <article
                  key={n.id}
                  className={cn(
                    "surface p-4 transition-colors",
                    picked && "border-primary ring-1 ring-primary/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">#{i + 1}</p>
                      <h3 className="text-base">{n.name}</h3>
                      <p className="text-sm font-medium text-foreground">
                        ${n.rentLow.toLocaleString()}–${n.rentHigh.toLocaleString()}/mo
                        {overBudget && (
                          <span className="ml-2 text-xs font-semibold text-caution">
                            above your budget
                          </span>
                        )}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant={inCompare ? "secondary" : "outline"}
                      onClick={() => toggleCompare(n.id)}
                      aria-pressed={inCompare}
                    >
                      {inCompare ? <Check className="size-4" /> : <Plus className="size-4" />}
                      {inCompare ? "Added" : "Compare"}
                    </Button>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{n.why}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <ScoreTag
                      icon={<Train className="size-3.5" aria-hidden />}
                      label={`Transit ${n.transitScore}`}
                    />
                    <ScoreTag
                      icon={<ShieldCheck className="size-3.5" aria-hidden />}
                      label={`Safety ${n.safetyScore}`}
                    />
                    <ScoreTag
                      icon={<Timer className="size-3.5" aria-hidden />}
                      label={`${n.commuteMins} min commute`}
                    />
                    <SourceCite metric="neighborhoodRent" />
                    <SourceCite metric="transitScore" />
                    <SourceCite metric="safetyScore" />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{n.vibe}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant={picked ? "default" : "ghost"}
                      onClick={() => setChosenNeighborhood(picked ? null : n.id)}
                    >
                      {picked ? "Selected" : "Choose"}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={!chosenNeighborhood}
            onClick={() => advance(3)}
          >
            Verify this neighbourhood's fact sheet
            <ArrowRight className="size-4" aria-hidden />
          </Button>
          {!chosenNeighborhood && (
            <p className="text-center text-xs text-muted-foreground">
              Choose a neighbourhood to continue.
            </p>
          )}
        </section>
      )}

      {compare.length >= 2 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {compare.length} neighbourhoods selected
            </p>
            <Button size="sm" onClick={() => setCompareOpen(true)}>
              <Scale className="size-4" aria-hidden />
              Compare ({compare.length})
            </Button>
          </div>
        </div>
      )}

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Side-by-side</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr>
                  <th className="w-28 p-2 text-left text-xs font-semibold text-muted-foreground">
                    &nbsp;
                  </th>
                  {compared.map((n) => (
                    <th key={n.id} className="p-2 text-left align-bottom">
                      <span className="font-display text-sm font-semibold">{n.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleCompare(n.id)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                        aria-label={`Remove ${n.name}`}
                      >
                        <X className="inline size-3" />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(
                  [
                    ["Rent range", (n: (typeof compared)[number]) => `$${n.rentLow}–$${n.rentHigh}`],
                    ["Transit", (n: (typeof compared)[number]) => `${n.transitScore}/100`],
                    ["Safety", (n: (typeof compared)[number]) => `${n.safetyScore}/100`],
                    ["Commute", (n: (typeof compared)[number]) => `${n.commuteMins} min`],
                    ["Feel", (n: (typeof compared)[number]) => n.vibe],
                  ] as const
                ).map(([label, get]) => (
                  <tr key={label}>
                    <th className="p-2 text-left text-xs font-semibold text-muted-foreground">
                      {label}
                    </th>
                    {compared.map((n) => (
                      <td key={n.id} className="p-2 align-top text-secondary-foreground">
                        {get(n)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
