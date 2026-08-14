import { ShieldCheck, Sparkles, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

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
