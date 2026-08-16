import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { JourneyStageId } from "@/data/journey";

/** The three profiles the app personalises for. "student" gates University Housing Boards. */
export type NewcomerStatus = "student" | "job-offer" | "other";

export type Filters = {
  city: string;
  budget: number;
  status: NewcomerStatus;
};

type FlowValue = {
  filters: Filters;
  setFilters: (f: Filters) => void;
  journeyStage: JourneyStageId;
  setJourneyStage: (s: JourneyStageId) => void;
  /**
   * One-way handoff from Column 2 into Column 3: "Ask the AI Advisor about this"
   * queues a question for the advisor's composer. The advisor never writes back
   * into this or any Column 2 state — the data sources stay isolated.
   */
  advisorPrompt: string | null;
  askAdvisor: (text: string) => void;
  clearAdvisorPrompt: () => void;
};

const FlowContext = createContext<FlowValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [journeyStage, setJourneyStage] = useState<JourneyStageId>("pre-landing");
  const [filters, setFilters] = useState<Filters>({
    city: "Toronto",
    budget: 2000,
    // Do not assume newcomers are students — this is set via the persona picker.
    status: "other",
  });
  const [advisorPrompt, setAdvisorPrompt] = useState<string | null>(null);

  const value = useMemo<FlowValue>(
    () => ({
      filters,
      setFilters,
      journeyStage,
      setJourneyStage,
      advisorPrompt,
      askAdvisor: (text) => setAdvisorPrompt(text),
      clearAdvisorPrompt: () => setAdvisorPrompt(null),
    }),
    [filters, journeyStage, advisorPrompt],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used inside FlowProvider");
  return ctx;
}
