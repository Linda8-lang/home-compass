# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A mobile-first web prototype ("Housing Assistant") that helps newcomers to Toronto evaluate
housing options. It combines static, source-aware reference content with an AI Advisor
chat. Full product/flow context lives in `README.md` and `docs/user-and-data-flow.md` —
read those before making product-behavior changes; this file only covers what's needed to
work in the code.

## Commands

```sh
bun install              # install deps (Bun is the package manager)
bun dev                  # start dev server (vite dev)
bun run build             # production build
bun run build:dev         # dev-mode build
bun run preview           # preview a build
bun run lint               # eslint .
bun run format             # prettier --write .
bun run ingest             # run all data ingesters
bun run ingest:safety      # TPS neighbourhood crime rates (ArcGIS)
bun run ingest:rent        # City of Toronto CKAN neighbourhood profiles (rent proxy)
bun run ingest:cmhc        # CMHC Rental Market Survey baseline (requires CMHC_XLSX_URL; not yet populated)
```

There is no test suite/framework configured in this repo (no test script in `package.json`).

Copy `.env.example` to `.env` and set at least one of `LOVABLE_API_KEY` or `GEMINI_API_KEY`
for the AI Advisor to work locally — the static reference lane and Check the Place work
with zero keys configured.

## Architecture

**Stack:** TanStack Start v1 (React 19, SSR, file-based routing), Vite 8 via
`@lovable.dev/vite-tanstack-config` (Nitro, Cloudflare target by default), Tailwind CSS v4 +
shadcn/ui, Bun. Supabase client is scaffolded (`src/integrations/supabase/*`) but not
currently used by the housing feature.

### The two-lane boundary (the most important invariant in this codebase)

The product is built around a hard separation between two lanes:

- **Static reference** (Column 2: Find / Evaluate / Verify) — sourced from local data files
  only (`src/data/journey.ts`, `housing-sections.ts`, `sources.ts`, and ingested JSON under
  `src/data/generated/*`). Neutral, source-aware, never a curated recommendation.
- **AI Advisor** (Column 3) — a streaming chat backed by the Lovable AI Gateway
  (`google/gemini-2.5-flash`), falling back to the Gemini API directly (`GEMINI_API_KEY`,
  model configurable via `GEMINI_MODEL`) when `LOVABLE_API_KEY` is unset.

**Curated/ingested data (crime stats, rent benchmarks) must never be fed into the AI
Advisor's context.** Only the user's own in-app activity — reviewed criteria, selected
housing type, stage, budget — is sent to the model, via `advisorAppContext` built in
`FlowProvider`. Check the Place reads `src/data/generated/*` directly and never threads
into the Advisor's context. When touching either lane, preserve this boundary.

One deliberate exception: `src/data/sources.ts`'s small, human-authored legal/regulatory
citation registry (`src/lib/advisor-context.ts`) is matched deterministically against the
user's question and, when relevant, injected into the Advisor's system prompt so it can
cite the source by name and date. `src/data/generated/*` remains static-lane-only and is
unaffected by this.

### File-based routing (TanStack Start)

See `src/routes/README.md`. Every `.tsx` in `src/routes/` is a route (`index.tsx` → `/`,
`users/$id.tsx` → `/users/:id` dynamic, `files/$.tsx` → splat via `_splat`, `__root.tsx` is
the app shell). Don't create `src/pages/` or Next/Remix-style route files.
`src/routeTree.gen.ts` is auto-generated — never hand-edit it.

Per the top-level README's contribution notes: put app-internal logic in `*.functions.ts`
files imported by routes; keep raw HTTP endpoints for external callers under
`src/routes/api/public/*`. A module that must stay server-only should be named `*.server.ts`
(the `server-only` npm package is banned by an eslint rule — TanStack Start doesn't use it).

### State flow

`FlowProvider` (`src/components/housing/flow-state.tsx`) holds shared session state:
`journeyStage`, `filters` (city/budget/status), `selectedHousingTypeId`,
`isCriterionReviewed`, `advisorPrompt`, `advisorAppContext`. Most of this is in-memory and
resets on refresh; only Evaluate Housing's `reviewed` criteria and Check the Place's saved
places persist, and each uses its own separate `localStorage` key. A "ask the AI Advisor
about this" handoff from Column 2 to Column 3 is one-way — the Advisor never writes back
into Column 2 state.

### AI Advisor request path

`advisor-chat.tsx` → `POST /api/advisor` (`src/routes/api/advisor.ts`), which in order:
requires an AI key (500 if both `LOVABLE_API_KEY`/`GEMINI_API_KEY` absent) → validates the
body (400) → enforces session question cap / per-message char cap / per-IP hourly budget
(`src/lib/advisor-limits.ts`, in-memory/best-effort) → truncates history to the last 8 turns
→ prepends the guardrail system prompt (Ontario-specific rules, scam-pattern flagging,
"never invent listings/addresses/prices", a clarifying-question protocol capped at 3
questions) → prepends the app-context line → calls the Lovable AI Gateway (stream) or the
Gemini API directly as a fallback (different wire format: `systemInstruction`,
"user"/"model" roles instead of "assistant") → maps upstream failures to user-facing errors
(429/402/404/etc.) → streams plain-text deltas back to the client.

The clarifying-question protocol and the fabrication ban both live in the system prompt in
`advisor.ts`, not in UI logic — changing AI behavior means editing that prompt (and updating
`src/data/advisor-samples.ts` if sample conversations should reflect it).

### Data ingestion

`src/data/generated/*.json` (and the derived `neighbourhood-lookup.ts`) are produced by
`scripts/ingest/*` — never hand-edit them. Each ingester validates against a schema
(`scripts/ingest/schemas/*`), writes atomically, and preserves the last-known-good file on
failure. Records join by `hood_id`, not `area_name`. Excel workbook parsing uses `exceljs`
(the `xlsx` npm package is banned in this repo — it has known vulnerabilities).

### Design constraints (see README for full list)

- Keep the three-column layout: index (Column 1), static reference (Column 2), AI Advisor
  (Column 3). On mobile the Advisor is the top section, never a floating widget/bubble.
- Static reference stays neutral — no curated recommendations.
- AI Advisor must ask clarifying questions and must not fabricate listings, addresses, or
  prices; it has no listing database.
- Factual claims should be source-aware (`src/data/sources.ts`); numerical/time-sensitive
  claims without a connected source should stay neutralized (`SourcePending`).
