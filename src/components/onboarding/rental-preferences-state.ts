import { useEffect, useState } from "react";
import type { LivingSetup, ManagementModel, RentalPreferences } from "@/data/onboarding";

/**
 * The only persona/preference state store in this app besides FlowProvider
 * (src/components/housing/flow-state.tsx). Onboarding and the main app are
 * separate routes/component trees, so this is persisted to localStorage
 * rather than React context — the main app reads whatever onboarding last
 * wrote, once it mounts.
 */
const STORAGE_KEY = "home-compass:rental-preferences";

const EMPTY_PREFERENCES: RentalPreferences = { managementModel: null, livingSetup: null };

function readStored(): RentalPreferences {
  if (typeof window === "undefined") return EMPTY_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<RentalPreferences>;
    return {
      managementModel: parsed.managementModel ?? null,
      livingSetup: parsed.livingSetup ?? null,
    };
  } catch {
    return EMPTY_PREFERENCES;
  }
}

function writeStored(preferences: RentalPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

/**
 * Separate from RentalPreferences itself: "Skip for now" leaves preferences
 * empty but should still count as onboarded, so `/` doesn't redirect back to
 * onboarding forever for someone who deliberately skipped.
 */
const COMPLETE_KEY = "home-compass:onboarding-complete";

/** SSR-safe: always false on the server, since onboarding state only exists in the browser. */
export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(COMPLETE_KEY) === "true";
}

export function markOnboardingComplete() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPLETE_KEY, "true");
}

/**
 * Read-and-write access to the persisted rental preferences.
 *
 * Starts at EMPTY_PREFERENCES on every render pass — including the client's
 * first render during hydration — and only syncs from localStorage inside an
 * effect, after mount. This app is server-rendered; reading localStorage in
 * the initial render would make the client's first render disagree with the
 * server-rendered HTML and trigger a hydration mismatch.
 */
export function useRentalPreferences() {
  const [preferences, setPreferences] = useState<RentalPreferences>(EMPTY_PREFERENCES);

  useEffect(() => {
    setPreferences(readStored());
  }, []);

  function setManagementModel(value: ManagementModel) {
    setPreferences((prev) => {
      const next = { ...prev, managementModel: value };
      writeStored(next);
      return next;
    });
  }

  function setLivingSetup(value: LivingSetup) {
    setPreferences((prev) => {
      const next = { ...prev, livingSetup: value };
      writeStored(next);
      return next;
    });
  }

  return { preferences, setManagementModel, setLivingSetup };
}
