import { createFileRoute } from "@tanstack/react-router";
import { FlowProvider, useFlow } from "@/components/housing/flow-state";
import { StepIndicator } from "@/components/housing/step-indicator";
import { StageOne } from "@/components/housing/stage-one";
import { StageTwo } from "@/components/housing/stage-two";
import { StageThree } from "@/components/housing/stage-three";
import { StageFour } from "@/components/housing/stage-four";
import { StageFive } from "@/components/housing/stage-five";
import { StageZero } from "@/components/housing/stage-zero";
import { AdvisorChat } from "@/components/housing/advisor-chat";

const title = "Housing Assistant — Find and secure a home in Toronto";
const description =
  "A guided, five-stage assistant for newcomers moving to Toronto: where to look, verified listing reports, negotiation coaching and application prep.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Stages() {
  const { step } = useFlow();
  return (
    <div className="min-h-screen bg-background">
      <StepIndicator />
      <main className="mx-auto w-full max-w-3xl px-4 py-7">
        {step === 0 && <StageZero />}
        {step === 1 && <StageOne />}
        {step === 2 && <StageTwo />}
        {step === 3 && <StageThree />}
        {step === 4 && <StageFour />}
        {step === 5 && <StageFive />}
        <p className="mt-12 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          Prototype — all listings, scores and reports are sample data.
        </p>
      </main>
      <AdvisorChat />
    </div>
  );
}

function Index() {
  return (
    <FlowProvider>
      <Stages />
    </FlowProvider>
  );
}
