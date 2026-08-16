import { useState } from "react";
import { ArrowRight, Plus, X, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HOUSING_CONSIDERATIONS } from "@/data/housing-considerations";
import { useFlow } from "./flow-state";
import { GuidanceDisclaimer, SectionTitle, StageHeader, VariesNote } from "./primitives";

const DIMENSION_ORDER = [
  "cost",
  "location",
  "commute",
  "transportation",
  "management",
  "occupancy",
  "lease",
  "documents",
  "duration",
];

const DIMENSIONS = [...HOUSING_CONSIDERATIONS].sort(
  (a, b) => DIMENSION_ORDER.indexOf(a.id) - DIMENSION_ORDER.indexOf(b.id),
);

type OptionNote = { id: string; name: string; notes: Record<string, string> };

export function StageTwo() {
  const { advance } = useFlow();
  const [options, setOptions] = useState<OptionNote[]>([
    { id: "a", name: "", notes: {} },
    { id: "b", name: "", notes: {} },
  ]);
  const [open, setOpen] = useState<string | null>(DIMENSIONS[0]?.id ?? null);

  const update = (id: string, patch: Partial<OptionNote>) =>
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));

  return (
    <div className="space-y-8 pb-16">
      <StageHeader
        eyebrow="Decision support"
        title="How to Evaluate Housing Options"
        intro="Dimensions worth comparing, things to consider on each, and the trade-off behind them. The comparison is yours to make."
      />
      <VariesNote />

      <section className="space-y-3">
        <SectionTitle
          aside={<span className="text-xs text-muted-foreground">{DIMENSIONS.length} dimensions</span>}
        >
          Dimensions to compare
        </SectionTitle>

        <div className="space-y-2">
          {DIMENSIONS.map((d) => {
            const expanded = open === d.id;
            return (
              <article key={d.id} className="surface overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 p-4 text-left"
                  onClick={() => setOpen(expanded ? null : d.id)}
                  aria-expanded={expanded}
                >
                  <span>
                    <span className="block font-display text-base font-semibold">{d.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {d.what}
                    </span>
                  </span>
                  <Plus
                    className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform ${
                      expanded ? "rotate-45" : ""
                    }`}
                    aria-hidden
                  />
                </button>

                {expanded && (
                  <div className="border-t border-border px-4 py-3">
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <ListChecks className="size-3.5" aria-hidden />
                      Things to consider
                    </p>
                    <ul className="space-y-1.5">
                      {d.questions.map((q) => (
                        <li key={q} className="text-sm leading-relaxed text-secondary-foreground">
                          · {q}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 rounded-lg bg-muted p-3 text-sm leading-relaxed text-secondary-foreground">
                      <span className="font-semibold">Trade-off: </span>
                      {d.tradeoff}
                    </p>
                    {d.local && (
                      <div className="mt-3 rounded-lg bg-sand p-3">
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground">
                          In Toronto
                        </p>
                        <ul className="space-y-1.5">
                          {d.local.map((l) => (
                            <li key={l} className="text-sm leading-relaxed text-secondary-foreground">
                              · {l}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <SectionTitle
          aside={
            options.length < 3 ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setOptions((prev) => [...prev, { id: crypto.randomUUID(), name: "", notes: {} }])
                }
              >
                <Plus className="size-4" aria-hidden />
                Add option
              </Button>
            ) : undefined
          }
        >
          Your own comparison
        </SectionTitle>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Write in the options you are considering. Nothing is scored — the weighting is yours.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((o, i) => (
            <div key={o.id} className="surface space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={o.name}
                  onChange={(e) => update(o.id, { name: e.target.value })}
                  placeholder={`Option ${i + 1} — area, building or listing`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    aria-label="Remove option"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setOptions((prev) => prev.filter((p) => p.id !== o.id))}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              {DIMENSIONS.slice(0, 8).map((d) => (
                <div key={d.id} className="space-y-1">
                  <label
                    htmlFor={`${o.id}-${d.id}`}
                    className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {d.title}
                  </label>
                  <Textarea
                    id={`${o.id}-${d.id}`}
                    rows={2}
                    value={o.notes[d.id] ?? ""}
                    onChange={(e) =>
                      update(o.id, { notes: { ...o.notes, [d.id]: e.target.value } })
                    }
                    placeholder="What you know so far"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <GuidanceDisclaimer />

      <Button size="lg" className="w-full" onClick={() => advance(3)}>
        Check an address against sourced data
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
