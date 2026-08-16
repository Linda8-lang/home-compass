import { createFileRoute } from "@tanstack/react-router";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

const title = "Get started — Housing Assistant";
const description =
  "Tell us what kind of rental you're aiming at so the app can tailor guidance to you.";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title }, { name: "description", content: description }],
  }),
  component: OnboardingFlow,
});
