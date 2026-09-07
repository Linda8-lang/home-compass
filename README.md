# Housing Assistant Prototype

A mobile-first web prototype that helps newcomers to Toronto evaluate housing options and prepare for the rental process. It combines static, source-aware reference content with an AI Advisor that asks clarifying questions before giving personalized guidance.

## The Product Idea

Newcomers face a dense, unfamiliar housing market. This prototype reduces decision fatigue by strictly separating two lanes (see `docs/user-and-data-flow.md` for the full flow):

- **Static reference (Column 2)** — structured, source-aware content: where to look, how to evaluate a place, and how to check a specific neighbourhood before committing. No curated listings or recommendations live here.
- **AI Advisor (Column 3)** — a conversational assistant that helps users explore their specific situation, compare trade-offs, and prepare for landlord conversations, without inventing listings or prices.

Curated/ingested data (crime stats, rent benchmarks) is never fed into the AI Advisor's context — only the user's own in-app activity (reviewed criteria, selected housing type, stage, budget) is. Two deliberate, code-controlled exceptions feed the Advisor from the static lane's own source files: a small legal/regulatory citation registry (`src/data/sources.ts`) it can cite by name and date, and a duration-tier resource directory (`src/data/housing-sections.ts`'s `durationResources`) it can point to — both matched by deterministic keywords, never chosen by the model itself.

## Key Features

1. **Find Housing** — two card groups (`src/data/housing-sections.ts`): pick a duration (temporary / short-term / long-term) and a housing type (managed buildings, owner-owned, rooms & shared, and university housing boards for students). Each card opens a "Learn more" panel with an external resource list.

2. **Evaluate Housing** — a factual checklist of criteria across living setup, costs, commute, lease/rent control, documents, strategy, negotiation, and application. Users can mark items "Reviewed"; progress persists in `localStorage` and is summarized for the AI Advisor.

3. **Check the Place** — looks up a Toronto neighbourhood by matching the typed address text against a known neighbourhood name (no geocoding), then shows a crime-rate comparison against the citywide average, sourced from Toronto Police Service open data. Users can save places to a shortlist (also `localStorage`-backed).

4. **AI Advisor**
   - Streaming chat. Primary provider is the Lovable AI Gateway (`google/gemini-2.5-flash`); if `LOVABLE_API_KEY` is not set, it falls back to calling the Gemini API directly with `GEMINI_API_KEY` (model configurable via `GEMINI_MODEL`).
   - Asks at most a few clarifying questions (destination, budget, commute, housing type, duration, constraints) before giving guidance, and reflects back what it already knows from app context.
   - Explicitly avoids fabricated listings, addresses, or prices — it has no listing database.
   - **Source-grounded citations** — when a legal/financial claim matches an entry in the citation registry (`src/data/sources.ts`, matched deterministically by `src/lib/advisor-context.ts`), the advisor names the source and its "updated" date and the client renders it as a linked footnote; everything else is explicitly hedged as general guidance, never presented with the same confidence.
   - **Resource directory** — a duration-tier keyword match (`src/lib/advisor-resources.ts`) surfaces up to 4 platforms straight from Find Housing's `durationResources`, rendered as tappable pills. Which platforms, in what order, and how many is decided in code before the prompt is built — the model only relays what it's given, verbatim, and never claims to have searched them or to know current availability or pricing.
   - Session limits enforced both client- and server-side: max questions per session, max characters per message, truncated conversation history, and a per-IP hourly request budget (`src/lib/advisor-limits.ts`).
   - Sample conversation states (`src/data/advisor-samples.ts`) let users preview realistic exchanges without spending a real turn.

5. **Stage- and persona-aware navigation** — Column 1 lets the user set a persona (student / job offer / other) and immigration stage (pre-landing / just landed / settling), which gate student-only resources and surface a stage-specific "heads up" note (`src/data/journey.ts`).

## User Experience

- Three-column layout on desktop: navigation index (Column 1), static reference (Column 2), and AI Advisor (Column 3).
- On mobile, the AI Advisor is a primary 70vh section at the top, with static reference below.
- Progressive disclosure: most detail is hidden behind expandable sections (`Disclosure`/`LearnMore`) to keep each screen focused.

## Data Flow

- User selections and shared session state (persona, stage, budget, reviewed criteria, selected housing type, and a one-way "ask the advisor about this" handoff) live in `FlowProvider` (`src/components/housing/flow-state.tsx`).
- Static content is sourced from modular data files:
  - `src/data/journey.ts` — immigration stage checklists.
  - `src/data/housing-sections.ts` — Find/Evaluate Housing content, cards, and resource lists.
  - `src/data/sources.ts` — citation/provenance registry for factual claims.
  - `src/data/advisor-samples.ts` — sample chat states.
  - `src/data/generated/*` — ingested neighbourhood safety (and, once populated, rent) data; see Data Ingestion below.
- Chat messages are sent to `src/routes/api/advisor.ts`, which enforces the session/rate limits, prepends the system prompt, deterministically matches and prepends a Verified data block (citations, via `src/lib/advisor-context.ts`) and a Resource directory block (duration-tier platforms, via `src/lib/advisor-resources.ts`) when either matches, prepends the app-context line, and streams the response back as plain text (from either the Lovable Gateway or the direct Gemini fallback) — with the matched citations and resources echoed back on an `X-Advisor-Sources` response header for the client to render.

## Data Ingestion

Reference datasets under `src/data/generated/*.json` (and the derived `neighbourhood-lookup.ts`) are produced by `scripts/ingest/*`, not hand-written:

```sh
bun run ingest         # run all ingesters
bun run ingest:safety  # Toronto Police Service neighbourhood crime rates (ArcGIS)
bun run ingest:rent    # City of Toronto Open Data (CKAN) neighbourhood profiles (rent proxy)
bun run ingest:cmhc    # CMHC Rental Market Survey baseline — requires CMHC_XLSX_URL; not yet populated
```

Each ingester validates its source against a schema (`scripts/ingest/schemas/*`), writes atomically, and preserves the last-known-good file on failure so a bad run never corrupts the promoted data. Records join by `hood_id`, not `area_name`. `xlsx` workbook parsing uses `exceljs`.

## Tech Stack

- **Framework:** TanStack Start v1 (React 19, SSR, file-based routing)
- **Build tool:** Vite 8, via `@lovable.dev/vite-tanstack-config` (Nitro, Cloudflare target by default)
- **Package manager:** Bun
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **AI:** Lovable AI Gateway (Gemini 2.5 Flash), with a direct Gemini API fallback
- **Auth / database:** Supabase client is scaffolded (`src/integrations/supabase/*`) but not currently used by the housing feature

## Local Development

```sh
bun install
bun dev
```

Then open the URL printed in the terminal. Copy `.env.example` to `.env` and set at least one AI provider key (`LOVABLE_API_KEY` or `GEMINI_API_KEY`) for the AI Advisor to work — the static reference lane and Check the Place work with no keys configured.

## How to Contribute

1. **Lovable editor** — If you have editor access, make changes in Lovable and they will sync to this repo.
2. **GitHub / local IDE** — Clone the repo, create a branch, make changes, and push. Changes will sync back into Lovable.
3. **Server functions** — Put app-internal logic in `*.functions.ts` files imported by routes; keep raw HTTP endpoints under `src/routes/api/public/*` for external callers.
4. **Static content** — Add or edit data in `src/data/*` and import it into the relevant Column 2 component (`choose-housing.tsx`, `column-two.tsx`, `check-the-place-report.tsx`).
5. **AI behavior** — Update the system prompt in `src/routes/api/advisor.ts` and sample interactions in `src/data/advisor-samples.ts`. To add a citation, edit `src/data/sources.ts` and its keyword list in `src/lib/advisor-context.ts`; to change what the resource directory can surface, edit `durationResources` in `src/data/housing-sections.ts` (the matching/selection logic in `src/lib/advisor-resources.ts` shouldn't need to change).
6. **Reference data** — Add or update ingesters under `scripts/ingest/` rather than hand-editing `src/data/generated/*`.

## Design Constraints

- Keep the three-column layout: index, static reference, AI Advisor.
- Static reference must stay neutral and not present curated housing recommendations.
- Curated/ingested data (crime stats, rent) must never be fed into the AI Advisor's context — only the user's own in-app activity may be. The citation registry and resource directory are the two deliberate exceptions, and both stay deterministic (keyword-matched in code, never chosen by the model).
- AI Advisor must ask clarifying questions and must not fabricate listings, addresses, or prices.
- All factual claims should be source-aware; time-sensitive or numerical estimates should be neutralized where sources are not yet connected.
- A legal/financial claim gets cited by name and date only when it's backed by `src/data/sources.ts`; otherwise it stays hedged as general guidance — never presented with the same confidence as a sourced fact.
- Resource-directory platforms are selected, ordered, and capped in code; the model must relay them verbatim and never rank, add to, or claim to have checked availability/pricing for them.
- Disclaimers should be subtle but present: "Informational guidance only. Requirements may vary by location and individual circumstances. Verify important requirements with the relevant official source."

## Deployment

This project can be deployed directly from Lovable, or you can host the code from the GitHub repo elsewhere (the Nitro build defaults to a Cloudflare target). Environment variables and secrets are managed through Lovable Cloud or your hosting provider.
