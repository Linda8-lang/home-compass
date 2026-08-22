import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { JourneyStageId } from "@/data/journey";
import {
  COMPARE_HOUSING_GROUPS,
  COST_BREAKDOWN_ITEMS,
  HOUSING_TYPE_CARDS,
} from "@/data/housing-sections";

/** The three profiles the app personalises for. "student" gates University Housing Boards. */
export type NewcomerStatus = "student" | "job-offer" | "other";

export type Filters = {
  city: string;
  budget: number;
  status: NewcomerStatus;
};

const REVIEWED_STORAGE_KEY = "home-compass:evaluate-housing-reviewed";

function readStoredReviewed(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(REVIEWED_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

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

  /**
   * Shared session state, lifted out of previously component-local state so the
   * AI Advisor can be given an honest picture of what the user has already done
   * in the static lane (Column 2) *as their own interactions* — which criteria
   * they've reviewed, their own self-entered cost inputs, which housing type
   * they picked. This is the user's own activity, not curated/ingested data, so
   * it does not cross the two-lane boundary documented in
   * docs/user-and-data-flow.md. Read-only from the Advisor's side; nothing here
   * is ever written back into Column 2 by the Advisor.
   */
  isCriterionReviewed: (id: string) => boolean;
  toggleCriterionReviewed: (id: string) => void;
  costValues: Record<string, number>;
  setCostValue: (id: string, value: number) => void;
  selectedHousingTypeId: string | null;
  setSelectedHousingTypeId: (id: string | null) => void;

  /**
   * Serialized summary of the above (reviewed criteria, cost calculator, selected
   * housing type only), meant to be sent as the `context` field to /api/advisor.
   * Deliberately excludes Check the Place / any curated or ingested data — see
   * the doc comment on CheckThePlaceReportInner in check-the-place-report.tsx
   * for why that boundary stays intact.
   */
  advisorAppContext: string;
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

  const [reviewed, setReviewed] = useState<Record<string, boolean>>(() => readStoredReviewed());
  useEffect(() => {
    try {
      window.localStorage.setItem(REVIEWED_STORAGE_KEY, JSON.stringify(reviewed));
    } catch {
      // localStorage unavailable (private mode, disabled storage, etc.) — state still works in-memory.
    }
  }, [reviewed]);
  const isCriterionReviewed = useCallback((id: string) => Boolean(reviewed[id]), [reviewed]);
  const toggleCriterionReviewed = useCallback((id: string) => {
    setReviewed((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const [costValues, setCostValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(COST_BREAKDOWN_ITEMS.map((item) => [item.id, item.defaultValue])),
  );
  const setCostValue = useCallback((id: string, value: number) => {
    setCostValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const [selectedHousingTypeId, setSelectedHousingTypeId] = useState<string | null>(null);

  const advisorAppContext = useMemo(() => {
    const lines: string[] = [];

    const reviewedCount = COMPARE_HOUSING_GROUPS.reduce(
      (sum, g) => sum + g.criteria.filter((c) => isCriterionReviewed(c.id)).length,
      0,
    );
    const totalCriteria = COMPARE_HOUSING_GROUPS.reduce((sum, g) => sum + g.criteria.length, 0);
    if (reviewedCount > 0) {
      const reviewedLabels = COMPARE_HOUSING_GROUPS.flatMap((g) =>
        g.criteria.filter((c) => isCriterionReviewed(c.id)).map((c) => c.label),
      );
      lines.push(
        `User has reviewed ${reviewedCount}/${totalCriteria} Evaluate Housing criteria: ${reviewedLabels.join(", ")}.`,
      );
    }

    const costTotal = Object.values(costValues).reduce((sum, v) => sum + v, 0);
    if (costTotal > 0) {
      const costParts = COST_BREAKDOWN_ITEMS.filter((item) => (costValues[item.id] ?? 0) > 0).map(
        (item) => `${item.label} $${costValues[item.id]}`,
      );
      lines.push(
        `User's own monthly cost calculator (self-entered, not a market estimate): ${costParts.join(", ")}. Total $${costTotal}.`,
      );
    }

    if (selectedHousingTypeId) {
      const card = HOUSING_TYPE_CARDS.find((c) => c.id === selectedHousingTypeId);
      if (card) lines.push(`User selected housing type: ${card.title}.`);
    }

    return lines.join(" ");
  }, [costValues, isCriterionReviewed, selectedHousingTypeId]);

  const value = useMemo<FlowValue>(
    () => ({
      filters,
      setFilters,
      journeyStage,
      setJourneyStage,
      advisorPrompt,
      askAdvisor: (text) => setAdvisorPrompt(text),
      clearAdvisorPrompt: () => setAdvisorPrompt(null),
      isCriterionReviewed,
      toggleCriterionReviewed,
      costValues,
      setCostValue,
      selectedHousingTypeId,
      setSelectedHousingTypeId,
      advisorAppContext,
    }),
    [
      filters,
      journeyStage,
      advisorPrompt,
      isCriterionReviewed,
      toggleCriterionReviewed,
      costValues,
      setCostValue,
      selectedHousingTypeId,
      advisorAppContext,
    ],
  );

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used inside FlowProvider");
  return ctx;
}
