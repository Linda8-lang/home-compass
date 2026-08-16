import {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Info,
  BookMarked,
  Compass,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, type ReactNode } from "react";

/** Neutral placeholder for factual items whose source is not yet connected. */
export function SourcePending({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground",
        className,
      )}
      title="No source has been connected for this item in the prototype."
    >
      <BookMarked className="size-3.5" aria-hidden />
      Source to be validated
    </span>
  );
}

/** Marks non-authoritative, general guidance (as opposed to sourced reference material). */
export function GuidanceBadge({ label = "General guidance", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-secondary-foreground",
        className,
      )}
    >
      <Compass className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

/** Explains the three kinds of information used across the prototype. */
export function EvidenceLegend({ className }: { className?: string }) {
  return (
    <div className={cn("surface flex flex-wrap items-center gap-x-4 gap-y-2 p-3", className)}>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-verified" aria-hidden />
        <strong className="font-semibold text-verified">Reference</strong> — factual, points at a source
      </span>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Compass className="size-3.5 text-secondary-foreground" aria-hidden />
        <strong className="font-semibold text-secondary-foreground">Guidance</strong> — general, not authoritative
      </span>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-advisor" aria-hidden />
        <strong className="font-semibold text-advisor">AI response</strong> — generated in the Advisor
      </span>
    </div>
  );
}

/**
 * Shared disclaimer badge pinned at the top of Column 2 and Column 3, so the
 * copy stays identical wherever it appears.
 */
export function DisclaimerBadge({ className }: { className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-caution/40 bg-caution-soft px-3 py-1 text-[11px] font-semibold text-caution",
        className,
      )}
    >
      <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
      Guidance, not legal advice
    </div>
  );
}

/** Subtle, non-dominant disclaimer for all static reference/checklist content. */
export function StaticDisclaimer({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground/90",
        className,
      )}
    >
      <Info className="mt-0.5 size-3 shrink-0" aria-hidden />
      <span>
        Informational guidance only. Requirements may vary by location and individual
        circumstances. Verify important requirements with the relevant official source.
      </span>
    </p>
  );
}

export function GuidanceDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground", className)}>
      <HelpCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      Guidance is informational and may vary by location and individual circumstances.
    </p>
  );
}


export function VerifiedBadge({ label = "Data-verified", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-verified-soft px-2.5 py-1 text-xs font-semibold text-verified",
        className,
      )}
    >
      <ShieldCheck className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

export function AdvisorBadge({ label = "AI guidance", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-advisor-soft px-2.5 py-1 text-xs font-semibold text-advisor",
        className,
      )}
    >
      <Sparkles className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

export function CautionBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-caution-soft px-2.5 py-1 text-xs font-semibold text-caution">
      <AlertTriangle className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}

export function StageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <header className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="text-2xl leading-tight text-foreground sm:text-3xl">{title}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">{intro}</p>
    </header>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-lg text-foreground">{children}</h2>
      {aside}
    </div>
  );
}

export function ScoreTag({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-sand px-2 py-1 text-xs font-medium text-secondary-foreground">
      {icon}
      {label}
    </span>
  );
}

export function VariesNote({
  children = "Information may vary by location and circumstance.",
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info className="size-3.5 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

/**
 * Progressive disclosure: shows a heading + one-line summary, keeps the
 * detail collapsed until the user asks for it.
 */
export function Disclosure({
  title,
  summary,
  aside,
  defaultOpen = false,
  moreLabel = "Learn more",
  lessLabel = "Show less",
  children,
  className,
}: {
  title: ReactNode;
  summary?: ReactNode;
  aside?: ReactNode;
  defaultOpen?: boolean;
  moreLabel?: string;
  lessLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={cn("rounded-xl border border-border/70 bg-card/40", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left"
      >
        <span className="min-w-0">
          <span className="block text-base leading-snug text-foreground">{title}</span>
          {summary && (
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              {summary}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {aside}
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            {open ? lessLabel : moreLabel}
            <ChevronDown
              className={cn("size-3.5 transition-transform", open && "rotate-180")}
              aria-hidden
            />
          </span>
        </span>
      </button>
      {open && <div className="space-y-3 border-t border-border/70 px-4 py-4">{children}</div>}
    </section>
  );
}

/** Inline "Learn more" toggle for a small amount of secondary detail. */
export function LearnMore({
  label = "Learn more",
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        {open ? "Show less" : label}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
}
