# Housing Assistant — User Flow & Data Flow

Mapped against the four-step AI-product flow template. Describes what the prototype
does today, and marks gaps as **GAP** where a step is not yet implemented.

---

## The two lanes

The product has two deliberately separated lanes, and every flow below belongs to one of them.

| Lane | Source of truth | Voice in UI |
| --- | --- | --- |
| **Static reference** (Stages 0–5) | Local data files: `src/data/journey.ts`, `mock.ts`, `housing-considerations.ts`, `sources.ts` | Green / neutral, source-aware badges ("Reference", "Guidance", "Source to be validated") |
| **AI Advisor** | Lovable AI Gateway → `google/gemini-2.5-flash` | Violet, always labelled AI, never presented as verified fact |

No AI output is ever written into the static lane, and no curated housing recommendation
ever appears in the static lane.

---

## User flow (end to end)

```text
Land on app
   │
   ▼
Stage 0 — Orientation hub
   ├─ pick immigration stage: Pre-landing │ Just landed │ Settling
   ├─ pick situation: Student │ Working │ Other newcomer
   └─ work the stage checklist (each item: Reference / Guidance + Source)
   │
   ▼
Stage 1 — Where to look
   └─ managed vs. owner-listed sites, scam patterns
      (student housing boards appear ONLY if situation = Student)
   │
   ▼
Stage 2 — How to evaluate housing options
   └─ dimensions: cost · location · commute · transport · type ·
      lease requirements · proximity · daily necessities  → user notes worksheet
   │
   ▼
Stage 3 — Verify a place
   └─ fact-sheet checks, what to ask, what documents to expect
   │
   ▼
Stage 4 — Talk to the landlord
   └─ hands off to the AI Advisor (listing coach / message coach)
   │
   ▼
Stage 5 — Application prep
   └─ documents, credit-substitute pack for newcomers

  ⟂ At any point, the AI Advisor column is available:
      ask question → advisor asks the minimum clarifying questions
      → streams guidance (never listings, never prices)
```

Navigation is non-linear: every stage is unlocked, the index column jumps anywhere.

---

## Data flow (end to end)

```text
┌───────────────────────── BROWSER ─────────────────────────┐
│                                                            │
│  Static data files (bundled, no network)                   │
│   journey.ts · mock.ts · housing-considerations.ts         │
│   sources.ts · advisor-samples.ts                          │
│            │ read                                          │
│            ▼                                               │
│      FlowProvider (React state, in-memory only)            │
│      { step, immigrationStage, situation, doneTasks }      │
│            │ filters/conditions                            │
│            ▼                                               │
│   Column 1 Index │ Column 2 Static reference │ Column 3 AI │
│                                                  │         │
│                                    last 12 turns + stage   │
└──────────────────────────────────────────────────┼─────────┘
                                                   ▼
                                    POST /api/advisor  (server route)
                                      1 auth key check
                                      2 validate body
                                      3 truncate history → 12 turns
                                      4 prepend guardrail system prompt
                                      5 prepend app-context line
                                      6 call Lovable AI Gateway (stream)
                                                   │
                                                   ▼
                                    google/gemini-2.5-flash (SSE)
                                                   │
                                    text deltas ◄──┘
                                                   ▼
                                    Advisor bubble grows token by token
```

Nothing is persisted: no database, no account, no PII. A refresh resets state.

---


The events that start a background (non-obvious) flow:

| # | Signal | Where it fires | What it starts |
| --- | --- | --- | --- |
| 1 | **Immigration stage selected** (Pre-landing / Just landed / Settling) | Stage 0 cards | Re-filters the checklist, heads-up note, and stage window from `JOURNEY_STAGES` |
| 2 | **Situation selected** (Student / Working / Other) | Stage 0 "Your situation" | Toggles student-only resources in Stage 1 (`STUDENT_POSTING_PLACES`) |
| 3 | **Task checked** | Stage 0 checklist | Writes `"<stageId>:<taskLabel>"` into `doneTasks`, updates the progress summary |
| 4 | **Stage navigation** | Index column | Changes `step`, which becomes the `context` string sent with the next AI request |
| 5 | **User submits a question** | Advisor input (or an example question / sample conversation) | The full AI round trip — the only network call in the product |

Signal 5 is the one with hidden logic. Signals 1–4 are synchronous, local, and instant.

---

## STEP 2 — Map the Hidden Logic

What happens between "user presses send" and "user sees words":

```
Advisor input (advisor-chat.tsx)
  └─ append {role:"user"} to local messages, set pending=true
     └─ POST /api/advisor  { messages: last 12, context: "current stage" }
        └─ server route (src/routes/api/advisor.ts)
           1. read LOVABLE_API_KEY from process.env  → 500 if absent
           2. parse + validate body                 → 400 if empty/invalid
           3. truncate history to the last 12 turns (cost + context control)
           4. prepend SYSTEM prompt:
                • Ontario-specific rules (deposits, notice periods)
                • newcomer-credit substitutes
                • scam-pattern flagging
                • "never invent listings, addresses, prices"
                • clarifying-question protocol (max 3 questions, then one at a time)
           5. prepend an app-context system line ("where the user is in the app")
           6. POST to Lovable AI Gateway with stream:true
           7. map upstream failures to human errors (429 rate limit, 402 credits, other)
           8. transform the SSE frames into a plain text delta stream
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
| Waiting for first token | `pending` state on the Advisor column | Inline typing indicator, input stays visible |
| Streaming answer | Assistant bubble grows token by token | Violet AI styling — visually distinct from green reference content |
| Model is still gathering inputs | "Still to clarify: …" banner (sample conversations) | Makes the clarifying protocol legible instead of feeling like interrogation |
| Answer is guidance, not fact | Footer line in Advisor column | "Guidance, not legal advice" |
| Static content limits | Subtle `StaticDisclaimer` near reference content | "Verify important requirements with the relevant official source" |
| Depth on demand | `Disclosure` / `LearnMore` wrappers on every stage | Primary question first; detail, sources and trade-offs one tap away |
| Layout | Three columns: index · static reference · Advisor | On mobile the Advisor is the top section, not a floating widget |

---

## STEP 4 — Build the Kill Switch

Data that leaves the client, and the recovery path for each failure.

**What is sent**
- Last 12 chat turns (text only)
- A short context string naming the current stage

**What is never sent**
- No account, no email, no address, no persisted profile — the whole session lives in
  `FlowProvider` React state and disappears on refresh
- No listing or market data (there is none)

**Recovery paths that exist today**

| Failure | User sees | Recovery |
| --- | --- | --- |
| `LOVABLE_API_KEY` missing | "AI is not configured." | Static lane keeps working — the product is usable with zero AI |
| Malformed / empty request | "No message provided." | Re-type and resend |
| 429 rate limit | "The advisor is rate limited right now — try again in a moment." | Retry by resending |
| 402 credits exhausted | "AI credits are exhausted for this workspace." | Fall back to static lane |
| Other upstream error | "The advisor could not answer (status)." | Retry; upstream detail logged server-side, not shown to the user |
| Bad or unhelpful answer | Answer is visibly labelled AI, sits beside sourced static content | User can cross-check against the reference column without leaving the screen |

**The structural kill switch:** the AI is additive. If the Advisor column is removed or
fails entirely, Stages 0–5 still deliver the core value — stage-aware checklists, the
neutral evaluation framework, scam patterns and resource lists.

**GAPs to close before production**
- No **stop / cancel** control on an in-flight stream (user cannot abort a bad answer).
- No **retry button** — the user must retype.
- No per-message **feedback or report** control.
- No persistence, so a refresh loses the conversation and all checklist progress.
- Source registry still contains "Source to be validated" placeholders.

---

## One-line summary

Local selections shape which static, source-labelled content is shown; the only data that
ever leaves the browser is the last twelve chat turns plus the current stage, which the
server wraps in a guardrailed prompt and streams back as clearly-labelled AI guidance
that the static lane never depends on.
