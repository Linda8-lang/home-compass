import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { NewcomerStatus } from "@/data/mock";

export type TransitPref = "subway" | "car" | "walk";

export type Filters = {
  city: string;
  budget: number;
  transit: TransitPref;
  destination: string;
  status: NewcomerStatus;
};

type FlowValue = {
  step: number;
  maxStep: number;
  goTo: (s: number) => void;
  advance: (s: number) => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  searched: boolean;
  setSearched: (v: boolean) => void;
  compare: string[];
  toggleCompare: (id: string) => void;
  chosenNeighborhood: string | null;
  setChosenNeighborhood: (id: string | null) => void;
  verifiedAddress: string | null;
  setVerifiedAddress: (a: string | null) => void;
  chosenListing: string | null;
  setChosenListing: (id: string | null) => void;
};

const FlowContext = createContext<FlowValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    city: "Toronto",
    budget: 2000,
    transit: "subway",
    destination: "University of Toronto, St. George",
    status: "student",
  });
  const [searched, setSearched] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [chosenNeighborhood, setChosenNeighborhood] = useState<string | null>(null);
  const [verifiedAddress, setVerifiedAddress] = useState<string | null>(null);
  const [chosenListing, setChosenListing] = useState<string | null>(null);

  const value = useMemo<FlowValue>(
    () => ({
      step,
      maxStep,
      goTo: (s) => {
        if (s <= maxStep) {
          setStep(s);
          if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
      advance: (s) => {
        setMaxStep((m) => Math.max(m, s));
        setStep(s);
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      },
      filters,
      setFilters,
      searched,
      setSearched,
      compare,
      toggleCompare: (id) =>
        setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id])),
      chosenNeighborhood,
      setChosenNeighborhood,
      verifiedAddress,
      setVerifiedAddress,
      chosenListing,
      setChosenListing,
    }),
    [step, maxStep, filters, searched, compare, chosenNeighborhood, verifiedAddress, chosenListing],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used inside FlowProvider");
  return ctx;
}
