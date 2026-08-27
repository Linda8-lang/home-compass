# Housing Assistant — User Flow & Data Flow

Mapped against the four-step AI-product flow template. Describes what the prototype
does today, and marks gaps as **GAP** where a step is not yet implemented.

---

## The two lanes

The product has two deliberately separated lanes, and every flow below belongs to one of them.

| Lane | Source of truth | Voice in UI |
| --- | --- | --- |
| **Static reference** (Column 2: Find / Evaluate / Verify) | Local data files: `src/data/journey.ts`, `housing-sections.ts`, `sources.ts`, plus ingested JSON under `src/data/generated/*` | Neutral, source-aware badges ("Reference", "General guidance", "Source to be validated", "Data-verified") |
| **AI Advisor** (Column 3) | Lovable AI Gateway → `google/gemini-2.5-flash`, falling back to the Gemini API directly (`GEMINI_API_KEY`) when `LOVABLE_API_KEY` is not set | Violet, always labelled "AI-generated", never presented as verified fact |

No AI output is ever written into the static lane, and no curated housing recommendation
ever appears in the static lane. Curated/ingested data (crime stats, rent benchmarks) is
never fed into the AI Advisor's context — only the user's own in-app activity is (see
`advisorAppContext` below).

---

## User flow (end to end)

```text
Land on app (three columns, always all visible — no wizard/steps)
   │
   ├─ Column 1 — Index & navigation
   │    ├─ pick your situation: Student │ Job offer │ Other
   │    │    (Student also reveals University Housing Boards in Find Housing)
   │    ├─ pick your stage: Pre-landing │ Just landed │ Settling
   │    │    (only changes the "Heads up for this stage" note — does not gate content)
   │    └─ jump links to each Column 2 section
   │
   ├─ Column 2 — Static reference (always all three sections present)
   │    ├─ Find Housing     — duration cards + housing-type cards, each with a
   │    │                     "Learn more" external resource list
   │    ├─ Evaluate Housing — factual checklist (costs, commute, lease/rent
   │    │                     control, documents, strategy, negotiation,
   │    │                     application); each item can be marked "Reviewed"
   │    └─ Check the Place  — type an address, matched by neighbourhood-name
   │                          substring (no geocoding) to TPS crime data;
   │                          save places to a shortlist
   │
   └─ Column 3 — AI Advisor (persistent, docked; never a bubble or takeover)
        ask a question → advisor asks the minimum clarifying questions
        → streams guidance (never listings, never prices)
```

Navigation is non-linear: every section is always rendered, the index column just scrolls to it.
"Ask the AI Advisor about this" links in Column 2 hand a pre-filled question to Column 3
(one-way — the Advisor never writes back into Column 2's state).

---

## Data flow (end to end)

```text
┌───────────────────────── BROWSER ─────────────────────────┐
│                                                            │
│  Static data files (bundled, no network)                  │
│   journey.ts · housing-sections.ts · sources.ts            │
│   advisor-samples.ts                                       │
│  Ingested data (bundled JSON, produced by scripts/ingest)   │
│   generated/safety_indices.json · generated/rent_benchmarks.json │
│   generated/neighbourhood-lookup.ts (join + lookup helpers) │
│            │ read                                           │
│            ▼                                                │
│      FlowProvider (React state; only `reviewed` criteria    │
│      persist to localStorage — everything else is           │
│      in-memory and resets on refresh)                       │
│      { journeyStage, filters:{city,budget,status},          │
│        selectedHousingTypeId, isCriterionReviewed,           │
│        advisorPrompt, advisorAppContext }                   │
│            │ filters/conditions                             │
│            ▼                                                │
│   Column 1 Index │ Column 2 Static reference │ Column 3 AI  │
│                        │                          │          │
│           Check the Place reads generated/*        │          │
│           directly (own localStorage key for       │          │
│           saved places) — never threaded into       │          │
│           advisorAppContext                          │          │
│                                          last 8 turns + context│
└──────────────────────────────────────────────────┼──────────┘
                                                   ▼
                                    POST /api/advisor  (server route)
                                      1 check LOVABLE_API_KEY / GEMINI_API_KEY present
                                      2 validate body
                                      3 enforce session/char/IP limits (advisor-limits.ts)
                                      4 truncate history → last 8 turns
                                      5 prepend guardrail system prompt
                                      6 prepend app-context line (stage, budget,
                                        status, reviewed criteria, selected housing type)
                                      7 call Lovable AI Gateway (stream), or the
                                        Gemini API directly if no Lovable key
                                                   │
                                                   ▼
                          google/gemini-2.5-flash (Lovable) — or gemini-2.0-flash
                          direct via GEMINI_MODEL override (SSE either way)
                                                   │
                                    text deltas ◄──┘
                                                   ▼
                                    Advisor bubble grows token by token
```

No account, no database, no PII leaves the browser. Chat messages, `journeyStage`, `filters`,
and `selectedHousingTypeId` are in-memory only and reset on refresh. The Evaluate Housing
"Reviewed" checkboxes and Check the Place's saved-places list persist in `localStorage`
(client-side only) and survive a refresh.

---

## STEP 1 — Identify the Signal

The events that start a background (non-obvious) flow:

| # | Signal | Where it fires | What it starts |
| --- | --- | --- | --- |
| 1 | **Situation selected** (Student / Job offer / Other) | Column 1 "Your situation" | Toggles the University Housing Boards card in Find Housing |
| 2 | **Stage selected** (Pre-landing / Just landed / Settling) | Column 1 "Your stage" | Updates the "Heads up for this stage" note and the stage line sent as AI context |
| 3 | **Evaluate Housing item checked** | Column 2 checklist | Writes to `reviewed` (persisted to `localStorage`), updates the progress badge, and feeds `advisorAppContext` |
| 4 | **Housing type selected** | Find Housing type cards | Sets `selectedHousingTypeId` in `FlowProvider`, feeds `advisorAppContext` |
| 5 | **Address submitted in Check the Place** | Column 2 "Check the Place" | Local-only text match against ingested neighbourhood data — no network call, never touches the Advisor |
| 6 | **User submits a question** | Advisor input (or a suggestion / sample conversation) | The full AI round trip — the only network call in the product |

Signal 6 is the one with hidden logic. Signals 1–5 are synchronous, local, and instant.

---

## STEP 2 — Map the Hidden Logic

What happens between "user presses send" and "user sees words":

```
Advisor input (advisor-chat.tsx)
  └─ append {role:"user"} to local messages, set pending=true
     └─ POST /api/advisor  { messages: last 8, context: "stage + budget + status
                              + reviewed criteria + selected housing type" }
        └─ server route (src/routes/api/advisor.ts)
           1. require LOVABLE_API_KEY or GEMINI_API_KEY  → 500 if both absent
           2. parse + validate body                      → 400 if empty/invalid
           3. reject over the session question cap        → 429
           4. reject over the per-message character cap    → 400
           5. reject over the per-IP hourly request budget → 429 (in-memory map, best-effort)
           6. truncate history to the last 8 turns (cost + context control)
           7. prepend SYSTEM prompt:
                • Ontario-specific rules (deposits, notice periods)
                • newcomer-credit substitutes
                • scam-pattern flagging
                • "never invent listings, addresses, prices"
                • clarifying-question protocol (max 3 questions, then one at a time)
           8. prepend the app-context system line
           9. POST to the Lovable AI Gateway with stream:true — or, if
              LOVABLE_API_KEY is unset, call the Gemini API directly instead
              (different wire format: system prompt as `systemInstruction`,
              roles are "user"/"model" not "assistant")
          10. map upstream failures to human errors (429 rate limit, 402 credits
              exhausted, 404 model unavailable, other)
          11. transform the SSE frames into a plain text delta stream
        └─ client reads the stream and appends deltas to the last assistant message
```

Two decisions here are product decisions expressed as code:

- **The clarifying-question protocol lives in the prompt, not the UI.** The model must
  reflect back what it already knows and ask only the minimum missing inputs
  (destination, work/school location, budget, housing type, commute tolerance,
  temp vs. long-term, hard constraints).
- **Fabrication is forbidden at the prompt level.** There is no listing database, so the
  model is instructed to say so and pivot to *how to look* rather than *what to rent*.

---

## STEP 3 — Design the Interaction Maneuver

Each sub-step of the hidden logic has an assigned UI surface, so nothing happens silently.

| Sub-step | UI placement | Treatment |
| --- | --- | --- |
| Request accepted | User bubble appears immediately in the Advisor column | Optimistic, no spinner blocking input |
| Waiting for first token | `pending` state on the Advisor column | Inline "Thinking…" indicator, input stays visible |
| Streaming answer | Assistant bubble grows token by token | Violet AI styling, "AI-generated" label — visually distinct from Column 2's styling |
| Model is still gathering inputs | "Still to clarify: …" banner (sample conversations) | Makes the clarifying protocol legible instead of feeling like interrogation |
| Answer is guidance, not fact | `DisclaimerBadge` at the top of the Advisor column | "Guidance, not legal advice" |
| Static content limits | Subtle `StaticDisclaimer` near reference content | "Verify important requirements with the relevant official source" |
| Depth on demand | `Disclosure` / `LearnMore` wrappers throughout Column 2 | Primary question first; detail, sources and resource links one tap away |
| Session budget visible | Composer footer | "`N` of 15 questions left in this conversation" |
| Layout | Three columns: index · static reference · Advisor | On mobile the Advisor is the top section, not a floating widget |

---

## STEP 4 — Build the Kill Switch

Data that leaves the client, and the recovery path for each failure.

**What is sent**
- Last 8 chat turns (text only)
- A short context string: immigration stage, budget, city, status, reviewed Evaluate
  Housing criteria, and the selected housing type (the user's own in-app activity only)

**What is never sent**
- No account, no email, no persisted profile
- No curated/ingested data (Check the Place's crime/rent figures never enter the Advisor's context)
- No listing or market data (there is none)

**Recovery paths that exist today**

| Failure | User sees | Recovery |
| --- | --- | --- |
| No AI key configured (`LOVABLE_API_KEY` and `GEMINI_API_KEY` both unset) | "AI is not configured." | Static lane keeps working — the product is usable with zero AI |
| Malformed / empty request | "No message provided." | Re-type and resend |
| Session question cap reached (15) | "You have reached this session's limit of 15 questions…" | Start a new conversation |
| Message too long (600 chars) | "Questions are limited to 600 characters." | Shorten and resend |
| Per-IP hourly budget exceeded | "Hourly usage limit reached — please try again later." | Retry later |
| 429 rate limit (either provider) | "The advisor is rate limited right now — try again in a moment." | Retry by resending |
| 402 credits exhausted (Lovable) | "AI credits are exhausted for this workspace." | Fall back to static lane |
| 404 model unavailable (Gemini fallback) | "The configured AI model is unavailable — set `GEMINI_MODEL` to a current model name." | Operator sets `GEMINI_MODEL` |
| Other upstream error | "The advisor could not answer (status)." | Retry; upstream detail logged server-side, not shown to the user |
| Bad or unhelpful answer | Answer is visibly labelled AI, sits beside sourced static content | User can cross-check against the reference column without leaving the screen |

**The structural kill switch:** the AI is additive. If the Advisor column is removed or
fails entirely, Find Housing, Evaluate Housing, and Check the Place still deliver the
core value — stage-aware notes, the neutral evaluation checklist, resource links, and the
neighbourhood crime lookup.

**GAPs to close before production**
- No **stop / cancel** control on an in-flight stream (user cannot abort a bad answer).
- No **retry button** — the user must retype.
- No per-message **feedback or report** control.
- Chat history and stage/status selections are not persisted, so a refresh loses the
  conversation (Evaluate Housing progress and Check the Place saved places do persist,
  via `localStorage`).
- Several "reference"-tagged journey tasks (`src/data/journey.ts`) still have no
  `citation`, so they render `SourcePending` ("Source to be validated").
- Rent data is ingested (`generated/rent_benchmarks.json`, plus an optional CMHC
  baseline once `CMHC_XLSX_URL` is configured) and exposed via
  `generated/neighbourhood-lookup.ts`, but Check the Place currently renders only the
  crime comparison — no rent visuals are wired into the UI yet.

---

## One-line summary

Local, mostly-ephemeral selections shape which static, source-labelled content is shown;
the only data that ever leaves the browser is the last eight chat turns plus a summary of
the user's own in-app activity, which the server rate-limits, wraps in a guardrailed
prompt, and streams back (via the Lovable Gateway or a direct Gemini fallback) as
clearly-labelled AI guidance that the static lane never depends on.
