import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { StageHeader } from "@/components/housing/primitives";
import { MANAGEMENT_MODEL_OPTIONS, LIVING_SETUP_OPTIONS } from "@/data/onboarding";
import { OptionTile } from "./option-tile";
import { useRentalPreferences } from "./rental-preferences-state";

/**
 * Onboarding flow. Currently a single step (rental preferences) — built as
 * its own route/component tree since none existed before. If more steps are
 * added later, this is the place to introduce a step sequence/progress
 * indicator; for one step, that scaffolding would be premature.
 */
export function OnboardingFlow() {
  const navigate = useNavigate();
  const { preferences, setManagementModel, setLivingSetup } = useRentalPreferences();

  function goToApp() {
    void navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-6 px-4 py-10">
        <StageHeader
          eyebrow="Before you start"
          title="Which kind of rental are you aiming at?"
          intro="This tailors what you see across the app. You can change it later."
        />

        <section className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Who you're renting from
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {MANAGEMENT_MODEL_OPTIONS.map((option) => (
              <OptionTile
                key={option.value}
                option={option}
                selected={preferences.managementModel === option.value}
                onSelect={() => setManagementModel(option.value)}
              />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            How you're living
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {LIVING_SETUP_OPTIONS.map((option) => (
              <OptionTile
                key={option.value}
                option={option}
                selected={preferences.livingSetup === option.value}
                onSelect={() => setLivingSetup(option.value)}
              />
            ))}
          </div>
        </section>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={goToApp}
            className="text-xs font-medium text-muted-foreground hover:underline"
          >
            Skip for now
          </button>
          <Button type="button" onClick={goToApp}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
