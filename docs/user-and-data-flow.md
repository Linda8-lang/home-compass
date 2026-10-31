# Housing Assistant — User Flow & Data Flow

Mapped against the four-step AI-product flow template. Describes what the prototype
does today, and marks gaps as **GAP** where a step is not yet implemented.

---

## The two lanes

The product has two deliberately separated lanes, and every flow below belongs to one of them.

| Lane | Source of truth | Voice in UI |
| --- | --- | --- |
| **Static reference** (Column 2: Find / Evaluate / Verify) | Local data files: `src/data/journey.ts`, `housing-sections.ts`, `sources.ts`, plus ingested JSON under `src/data/generated/*` | Neutral, source-aware badges ("Reference", "General guidance", "Source to be validated", "Data-verified") |
| **AI Advisor** (Column 3) | Groq (`GROQ_API_KEY`) → `qwen/qwen3.8-27b` by default, configurable via `GROQ_MODEL` | Violet, always labelled "AI-generated", never presented as verified fact |

No AI output is ever written into the static lane, and no curated housing recommendation
ever appears in the static lane. Curated/ingested data (crime stats, rent benchmarks) is
never fed into the AI Advisor's context — only the user's own in-app activity is (see
`advisorAppContext` below).

One deliberate exception: `src/data/sources.ts`'s small citation registry (legal/regulatory
sources, human-authored) is matched deterministically against the user's question and,
when relevant, injected so the Advisor can cite the source by name and date. `src/data/generated/*`
remains static-lane-only and is unaffected by this.

A second, separate mechanism gives the Advisor a **resource directory**: a deterministic
keyword match against the user's question picks a duration tier (temporary / short-term /
long-term) and hands over up to 4 platforms read straight from `durationResources`
(`src/data/housing-sections.ts` — static-lane source data, not ingested data). This is
navigation ("where to look"), not a sourced fact, and it's kept as a distinct context
block and a distinct entry type from citations. The model never selects, ranks, or adds to
the list — which platforms appear, in what order, capped at how many, is decided in code
(`src/lib/advisor-resources.ts`) before the prompt is built.

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
   │    └─ Check the Place  — type an address, geocoded via /api/geocode (falls
   │                          back to neighbourhood-name substring) to TPS
   │                          crime data; save places to a shortlist
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
                                      1 check GROQ_API_KEY present
                                      2 validate body
                                      3 enforce session/char/IP limits (advisor-limits.ts)
                                      4 truncate history → last 8 turns
                                      5 prepend guardrail system prompt
                                      6 match citations (advisor-context.ts) → prepend
                                        Verified data block if any matched
                                      7 match duration tier (advisor-resources.ts) →
                                        prepend Resource directory block if any matched
                                      8 prepend app-context line (stage, budget,
                                        status, reviewed criteria, selected housing type)
                                      9 call Groq chat completions (stream)
                                                   │
                                                   ▼
                          qwen/qwen3.8-27b by default, or the
                          GROQ_MODEL override (SSE)
                                                   │
                          text deltas + X-Advisor-Sources header (curated + resource) ◄──┘
                                                   ▼
                    Advisor bubble grows token by token; citation footnote row and/or
                    resource-pill row render underneath once the header is read
```

No account and no database. What the user types does leave the browser: Advisor questions
go to Groq, and Check the Place addresses go to Nominatim via `/api/geocode` (cached in server
memory for up to 24 hours). Chat messages, `journeyStage`, `filters`,
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
| 5 | **Address submitted in Check the Place** | Column 2 "Check the Place" | `POST /api/geocode` (Nominatim, then point-in-polygon against the neighbourhood boundaries), falling back to a local text match on any failure — never touches the Advisor |
| 6 | **User submits a question** | Advisor input (or a suggestion / sample conversation) | The full AI round trip |

Signal 6 is the one with hidden logic. Signals 1–4 are synchronous, local, and instant;
signal 5 makes one server call for the address lookup.

---

## STEP 2 — Map the Hidden Logic

What happens between "user presses send" and "user sees words":

```
Advisor input (advisor-chat.tsx)
  └─ append {role:"user"} to local messages, set pending=true
     └─ POST /api/advisor  { messages: last 8, context: "stage + budget + status
                              + reviewed criteria + selected housing type" }
        └─ server route (src/routes/api/advisor.ts)
           1. require GROQ_API_KEY                       → 500 if absent
           2. parse + validate body                      → 400 if empty/invalid
           3. reject over the session question cap        → 429
           4. reject over the per-message character cap    → 400
           5. reject over the per-IP hourly request budget → 429 (in-memory map, best-effort)
           6. truncate history to the last 8 turns (cost + context control), keeping
              only each message's role and content (Groq rejects extra fields)
           7. prepend SYSTEM prompt:
                • Ontario-specific rules (deposits, notice periods)
                • newcomer-credit substitutes
                • scam-pattern flagging
                • "never invent listings, addresses, prices"
                • sourcing rule: cite name + date from the Verified data block when
                  available, otherwise say plainly it's general guidance
                • legal/financial claims: qualifying language only, never universal
                • resource-directory rule: relay exactly what's given, in that order,
                  never rank/recommend/add one, never claim availability or pricing
                • clarifying-question protocol (max 3 questions, then one at a time)
           8. retrieveVerifiedContext(latest message) — deterministic keyword match
              against src/data/sources.ts's CITATIONS (advisor-context.ts, no LLM
              call) → prepend the formatted Verified data block if anything matched
           9. getResourcePointers(latest message) — deterministic duration-tier
              keyword match against durationResources (advisor-resources.ts, no LLM
              call) → prepend the formatted Resource directory block (≤ 4 items, in
              their original order) if a tier matched
          10. prepend the app-context system line
          11. POST to Groq's OpenAI-compatible chat completions API with stream:true
          12. map upstream failures to human errors (502 unreachable, 429 rate limit,
              404 model unavailable, 401/403 misconfigured key, other)
          13. transform the SSE frames into a plain text delta stream; attach the
              matched citations + resource pointers as JSON on the X-Advisor-Sources
              response header
        └─ client reads the stream and appends deltas to the last assistant message;
           reads X-Advisor-Sources once and attaches it to that message for rendering
```

Three decisions here are product decisions expressed as code:

- **The clarifying-question protocol lives in the prompt, not the UI.** The model must
  reflect back what it already knows and ask only the minimum missing inputs
  (destination, work/school location, budget, housing type, commute tolerance,
  temp vs. long-term, hard constraints).
- **Fabrication is forbidden at the prompt level.** There is no listing database, so the
  model is instructed to say so and pivot to *how to look* rather than *what to rent*.
- **Citations and resource links are selected outside the model, not requested from it.**
  Both `retrieveVerifiedContext` and `getResourcePointers` run deterministic keyword
  matching in code before the prompt is built; the model only relays what it's handed,
  verbatim, and the same matched data is echoed back on `X-Advisor-Sources` so the UI
  doesn't have to parse it out of the model's prose.

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
| A claim is backed by a named source | Small linked footnote row under the assistant bubble | "Label — source name, updated date", distinct from the resource-pill row |
| Duration-tier platforms are relevant | Row of tappable pills under the assistant bubble | Same visual pattern as Check the Place's example-address chips — navigation, not an endorsement |
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

**What the server adds itself (not sent by the client)**
- A Verified data block, when the latest message keyword-matches an entry in
  `src/data/sources.ts`'s citation registry
- A Resource directory block, when the latest message keyword-matches a duration tier
  in `durationResources`
- Both are computed deterministically in code from local static-lane files — no LLM call,
  no ingested data — and are echoed back to the client on the `X-Advisor-Sources` header
  so the UI can render them without parsing the model's prose

**Recovery paths that exist today**

| Failure | User sees | Recovery |
| --- | --- | --- |
| No AI key configured (`GROQ_API_KEY` unset) | "AI is not configured." | Static lane keeps working — the product is usable with zero AI |
| Malformed / empty request | "No message provided." | Re-type and resend |
| Session question cap reached (15) | "You have reached this session's limit of 15 questions…" | Start a new conversation |
| Message too long (600 chars) | "Questions are limited to 600 characters." | Shorten and resend |
| Per-IP hourly budget exceeded | "Hourly usage limit reached — please try again later." | Retry later |
| Groq unreachable (502) | "The advisor could not be reached — try again in a moment." | Retry by resending |
| 429 rate limit | "The advisor is rate limited right now — try again in a moment." | Retry by resending |
| 401/403 rejected key | "AI is not configured correctly." | Operator fixes `GROQ_API_KEY` |
| 404 model unavailable | "The configured AI model is unavailable — set `GROQ_MODEL` to a current model name." | Operator sets `GROQ_MODEL` |
| Other upstream error | "The advisor could not answer (status)." | Retry; upstream detail logged server-side, not shown to the user |
| Bad or unhelpful answer | Answer is visibly labelled AI, sits beside sourced static content | User can cross-check against the reference column without leaving the screen |
| Missing/malformed `X-Advisor-Sources` header | No citation footnote or resource pills render | Answer text still streams normally — citations/resources are additive, never blocking |

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
prompt — deterministically enriched, in code, with any matching citation from
`src/data/sources.ts` and any matching resource-directory platforms from
`durationResources`, never selected by the model — and streams back (via Groq) as clearly-labelled AI guidance that the static lane
never depends on.
