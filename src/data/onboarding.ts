/**
 * Content for the onboarding flow's rental-preferences step.
 *
 * Option `value`s are deliberately the same ids used by the Evaluate Housing
 * page's Management Model / Living Setup criteria (see COMPARE_HOUSING_GROUPS
 * in src/data/housing-sections.ts), so a selection here can be matched against
 * those criteria without a separate translation table.
 */

export type ManagementModel = "corporate" | "individual-landlord";
export type LivingSetup = "entire-unit" | "shared-room";

export type RentalPreferences = {
  managementModel: ManagementModel | null;
  livingSetup: LivingSetup | null;
};

export type OnboardingOption<T extends string> = {
  value: T;
  label: string;
  supporting: string;
};

export const MANAGEMENT_MODEL_OPTIONS: OnboardingOption<ManagementModel>[] = [
  { value: "corporate", label: "Managed building", supporting: "Company-run, standard leases" },
  {
    value: "individual-landlord",
    label: "Individual owner",
    supporting: "More negotiable, more variance",
  },
];

export const LIVING_SETUP_OPTIONS: OnboardingOption<LivingSetup>[] = [
  { value: "entire-unit", label: "Whole unit, alone", supporting: "Full privacy" },
  { value: "shared-room", label: "Rooms & shared", supporting: "Cheapest, fastest" },
];
