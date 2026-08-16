import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FlowProvider } from "@/components/housing/flow-state";
import { AppShell } from "@/components/housing/app-shell";
import { hasCompletedOnboarding } from "@/components/onboarding/rental-preferences-state";

const title = "Housing Assistant — Find and secure a home in Toronto";
const description =
  "A newcomer guide to Toronto housing: a sourced static reference of stages, checklists and fact sheets, plus an AI Advisor for open questions and evaluating options.";

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

function Index() {
  const navigate = useNavigate();
  // Starts false on both server and client's first render, so this never
  // disagrees with the server-rendered HTML (localStorage only exists in the
  // browser). The redirect/reveal decision is made after mount, once we can
  // actually read it.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasCompletedOnboarding()) {
      void navigate({ to: "/onboarding", replace: true });
      return;
    }
    setReady(true);
  }, [navigate]);

  if (!ready) return null;

  return (
    <FlowProvider>
      <AppShell />
    </FlowProvider>
  );
}
