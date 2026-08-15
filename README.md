# Housing Assistant Prototype

A mobile-first web prototype that helps newcomers to Toronto evaluate housing options and prepare for the rental process. It combines static, source-aware reference information with an AI Advisor that asks clarifying questions before giving personalized guidance.

## The Product Idea

Newcomers face a dense, unfamiliar housing market. This prototype reduces decision fatigue by separating two things:

- **Factual reference (Green)** — structured, source-aware guidance about immigration stages, housing evaluation criteria, and application preparation.
- **AI Advisor (Violet)** — a conversational assistant that helps users explore their specific situation, compare trade-offs, and prepare for landlord conversations, without inventing listings or prices.

## Key Features

1. **Stage-aware reference**
   - Pre-landing, settling, and established immigration stages.
   - A neutral "How to Evaluate Housing Options" framework covering cost, location, commute, transportation, housing type, lease requirements, proximity, and daily necessities.
   - Source-aware badges: factual/reference items, general guidance, and to-be-validated sources.

2. **AI Advisor**
   - Streaming chat powered by the Lovable AI Gateway (Gemini 2.5 Flash).
   - Asks clarifying questions (destination, budget, commute, housing type, duration, constraints) before giving guidance.
   - Explicitly avoids fabricated listings or prices; it helps users explore information and prepare, not browse listings.

3. **Profile-driven resources**
   - Student vs. general housing resources shown conditionally based on the user's selected situation.

## User Experience

- Three-column layout on desktop: navigation index, static reference content, and AI Advisor.
- On mobile, the AI Advisor is a primary 70vh section at the top, with static reference below.
- Progressive disclosure: most details are hidden behind expandable sections to keep each screen focused on the user's most important question.

## Data Flow

- User selections and stage state live in `FlowProvider` context.
- Static content is sourced from modular data files:
  - `src/data/journey.ts` — immigration checklists and resources.
  - `src/data/housing-considerations.ts` — neutral evaluation framework.
  - `src/data/mock.ts` — sample resources and neighborhoods.
  - `src/data/sources.ts` — source registry.
  - `src/data/advisor-samples.ts` — sample chat states.
- Chat messages are sent to `src/routes/api/advisor.ts`, which forwards them to the Lovable AI Gateway with the system prompt and conversation context.

## Tech Stack

- **Framework:** TanStack Start v1 (React 19, SSR/SSG, file-based routing)
- **Build tool:** Vite 7
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **AI:** Lovable AI Gateway (Gemini 2.5 Flash)
- **Authentication / database (when needed):** Lovable Cloud

## Local Development

```sh
git clone <this-repository-url>
cd <repository-name>
bun install
bun dev
```

Then open http://localhost:8080.

## How to Contribute

1. **Lovable editor** — If you have editor access, make changes in Lovable and they will sync to this repo.
2. **GitHub / local IDE** — Clone the repo, create a branch, make changes, and push. Changes will sync back into Lovable.
3. **Server functions** — Put app-internal logic in `*.functions.ts` files imported by routes; keep raw HTTP endpoints under `src/routes/api/public/*` for external callers.
4. **Static content** — Add or edit data in `src/data/*` and import it into the relevant stage component.
5. **AI behavior** — Update the system prompt in `src/routes/api/advisor.ts` and sample interactions in `src/data/advisor-samples.ts`.

## Design Constraints

- Keep the three-column layout: index, static reference, AI Advisor.
- Static reference must stay neutral and not present curated housing recommendations.
- AI Advisor must ask clarifying questions and must not fabricate listings or prices.
- All factual claims should be source-aware; time-sensitive or numerical estimates should be neutralized where sources are not yet connected.
- Disclaimers should be subtle but present: "Informational guidance only. Requirements may vary by location and individual circumstances. Verify important requirements with the relevant official source."

## Deployment

This project can be deployed directly from Lovable, or you can host the code from the GitHub repo elsewhere. Environment variables and secrets are managed through Lovable Cloud or your hosting provider.
