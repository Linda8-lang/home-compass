import { createFileRoute } from "@tanstack/react-router";
import { FlowProvider } from "@/components/housing/flow-state";
import { AppShell } from "@/components/housing/app-shell";

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
  return (
    <FlowProvider>
      <AppShell />
    </FlowProvider>
  );
}
