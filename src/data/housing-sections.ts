/**
 * Static reference data for the Housing section's Column 2 (Static Reference Lane).
 *
 * Exactly three collapsible sections, matching the approved scope:
 *   1. Find Housing      — where to look (category types, no risk ratings or timelines)
 *   2. Compare Housing    — how to evaluate (a checklist framework, no listings/prices)
 *   3. Verify the Place   — how to check a place is real before you commit
 *
 * Nothing here is a listing, a price, an address, a risk rating or a timeline. Anything
 * that recommends or evaluates a specific place lives in the AI Advisor (Column 3), not here.
 */

export type SectionMeta = {
  id: "find" | "compare" | "verify";
  anchor: string;
  eyebrow: string;
  title: string;
};

export const HOUSING_SECTIONS: SectionMeta[] = [
  { id: "find", anchor: "find-housing", eyebrow: "Find Housing", title: "Where to Look" },
  {
    id: "compare",
    anchor: "compare-housing",
    eyebrow: "Evaluate Housing",
    title: "How to evaluate housing options",
  },
  {
    id: "verify",
    anchor: "verify-the-place",
    eyebrow: "Verify the Place",
    title: "Check the Place",
  },
];

/* ---------------------------------------------------------------------- */
/* 2.1 Find Housing (Where to Look)                                        */
/* ---------------------------------------------------------------------- */

export type HousingCategory = {
  id: string;
  title: string;
  description: string;
  /** Only rendered when the active persona is Student. */
  studentOnly?: boolean;
};

/** Categories, strictly these four — the fourth is persona-gated. */
export const FIND_HOUSING_CATEGORIES: HousingCategory[] = [
  {
    id: "managed",
    title: "Managed Buildings",
    description:
      "Property management companies operating full apartment complexes. A formal application and standard lease, with centralized or on-site staff for repairs and requests.",
  },
  {
    id: "owner",
    title: "Owner-Owned Units",
    description:
      "Private landlords renting an entire apartment or house they own directly, rather than through a management company.",
  },
  {
    id: "rooms",
    title: "Rooms & Shared Accommodations",
    description:
      "A private room within a shared residence, with common areas such as the kitchen and bathroom shared with other occupants.",
  },
  {
    id: "university",
    title: "University Housing Boards",
    description:
      "Off-campus listing boards and housing offices run by a university, generally restricted to students with a current login.",
    studentOnly: true,
  },
];

export const FIND_HOUSING_NOTE =
  "If you need somewhere to stay right away, short-term or furnished housing can bridge the gap until you secure permanent housing — treat it as a starting point, not a deadline.";

export type ResourceLink = { name: string; note: string };

/** General, non-commercial pointers for where people look — no curated inventory. */
export const FIND_HOUSING_RESOURCES: ResourceLink[] = [
  {
    name: "General listing sites",
    note: "Aggregate inventory spanning managed buildings and owner-listed units.",
  },
  {
    name: "Community and neighbourhood groups",
    note: "Often used for rooms and sublets — verify identity before sending anything.",
  },
  {
    name: "Room-share and roommate-matching apps",
    note: "Useful for matching on lifestyle before you know anyone in the city.",
  },
  {
    name: "Municipal or settlement-agency housing help",
    note: "Free, non-commercial help desks that can point you to local rental resources.",
  },
];

/** Shown only when persona === "Student". */
export const FIND_HOUSING_STUDENT_RESOURCES: ResourceLink[] = [
  {
    name: "University housing office",
    note: "Staff can review a lease and explain what's typical near campus.",
  },
  {
    name: "Student union and program group chats",
    note: "Sublets from students leaving for a term — confirm the person is a current student before proceeding.",
  },
];

/* ---------------------------------------------------------------------- */
/* 2.2 Evaluate Housing (How to evaluate housing options)                  */
/* ---------------------------------------------------------------------- */

export type EvaluationCriterion = {
  id: string;
  bullet: string;
  /** Pre-filled question offered via the "Ask the AI Advisor about this" affordance. */
  askAdvisorPrompt: string;
};

export type CriterionGroup = {
  id: string;
  title: string;
  criteria: EvaluationCriterion[];
};

/** No listings, cards, prices or addresses — a factual evaluation checklist only. */
export const COMPARE_HOUSING_GROUPS: CriterionGroup[] = [
  {
    id: "management-model",
    title: "Management Model",
    criteria: [
      {
        id: "corporate",
        bullet:
          "Corporate property management: a formal application and standard lease, with a management office or portal for repairs — usually consistent process, less room to negotiate.",
        askAdvisorPrompt:
          "What's different about renting from a corporate property manager versus an individual landlord?",
      },
      {
        id: "individual-landlord",
        bullet:
          "Individual landlord: more room to negotiate terms directly, but responsiveness on repairs and requests depends entirely on that one person.",
        askAdvisorPrompt:
          "What should I ask an individual landlord that I wouldn't need to ask a property management company?",
      },
    ],
  },
  {
    id: "living-setup",
    title: "Living Setup",
    criteria: [
      {
        id: "entire-unit",
        bullet:
          "Entire unit: full privacy and control over the space, but the highest cost and sole responsibility for all utilities and upkeep.",
        askAdvisorPrompt:
          "Is renting an entire unit realistic on my budget, or should I be looking at shared accommodation?",
      },
      {
        id: "shared-room",
        bullet:
          "Shared room or accommodation: lower cost and shared utilities, but less privacy — compatibility with roommates matters as much as the unit itself.",
        askAdvisorPrompt:
          "What should I ask before agreeing to a shared room or shared accommodation situation?",
      },
    ],
  },
  {
    id: "cost",
    title: "Total Housing Costs",
    criteria: [
      {
        id: "utilities",
        bullet:
          "Confirm which utilities — heat, hydro, water — are included in the rent, and estimate the monthly cost of any that aren't.",
        askAdvisorPrompt:
          "Which utilities are usually included in rent, and how should I confirm that before signing?",
      },
      {
        id: "internet",
        bullet:
          "Budget separately for home internet if it isn't bundled into rent — it's a recurring monthly cost on top of what's advertised.",
        askAdvisorPrompt:
          "Is internet ever included in rent in Toronto, and how much should I budget if I have to set it up myself?",
      },
      {
        id: "tenant-insurance",
        bullet: "Factor in tenant insurance as an ongoing monthly cost — many leases require it.",
        askAdvisorPrompt: "Is tenant insurance actually required, and roughly what does it cost?",
      },
      {
        id: "deposits",
        bullet:
          "Total the deposits you'll be asked for upfront — first and last month's rent plus a refundable key or utility deposit — and check that against local rules.",
        askAdvisorPrompt:
          "What deposits am I legally allowed to be asked for, and what should I do if a landlord asks for more?",
      },
      {
        id: "kitchen-setup",
        bullet:
          "Budget a one-time cost for kitchen setup — basic cookware and utensils — if the unit is unfurnished.",
        askAdvisorPrompt:
          "Help me think through the one-time move-in costs I should budget for beyond the monthly rent.",
      },
    ],
  },
  {
    id: "commute",
    title: "Commute",
    criteria: [
      {
        id: "winter-cold",
        bullet:
          "Factor in winter cold exposure on the route — waiting outside for a bus or walking a transfer segment feels very different at -15°C than it does in summer.",
        askAdvisorPrompt: "How should I think about this commute differently once winter hits?",
      },
      {
        id: "ttc-overcrowding",
        bullet:
          "Account for real TTC overcrowding and delays at peak hours, not just the posted schedule — some routes are reliably packed or short-turned during rush hour.",
        askAdvisorPrompt:
          "How do I find out if a transit route is actually reliable at rush hour, not just on paper?",
      },
      {
        id: "carpool-wait",
        bullet:
          "If you're relying on a carpool, factor in realistic pickup and wait times, which can add significantly to a commute that looks short on paper.",
        askAdvisorPrompt:
          "What should I account for if I'm planning to carpool instead of taking transit?",
      },
      {
        id: "bike-lanes",
        bullet:
          "Check for dedicated bike lanes on the route if cycling is an option — a route without them can be materially slower and less safe.",
        askAdvisorPrompt:
          "Is cycling a realistic commute option for this kind of route in Toronto?",
      },
    ],
  },
  {
    id: "transportation",
    title: "Transportation",
    criteria: [
      {
        id: "transit-vs-highway",
        bullet:
          "Check proximity to subway or streetcar lines versus proximity to a highway — the former matters more if you don't drive, the latter if you do.",
        askAdvisorPrompt:
          "I'm not sure yet if I'll need a car — how should that affect where I look?",
      },
      {
        id: "option-count",
        bullet:
          "Count the total number of transit options available at a location (subway, streetcar, multiple bus routes) — more options means more resilience when one line has delays.",
        askAdvisorPrompt:
          "How do I evaluate whether a location's transit access is actually good, beyond distance on a map?",
      },
    ],
  },
  {
    id: "lease",
    title: "Lease Terms",
    criteria: [
      {
        id: "length-lowers-rent",
        bullet:
          "Longer-term leases typically come with a lower monthly rent than a month-to-month or short lease — weigh that saving against how much flexibility you need.",
        askAdvisorPrompt: "What are the trade-offs of signing a longer lease versus a shorter one?",
      },
      {
        id: "rent-control-exemption",
        bullet:
          "Ontario's annual rent-increase guideline does not apply to buildings first occupied for residential use after November 15, 2018 — confirm a building's exemption status rather than assuming increases are capped.",
        askAdvisorPrompt:
          "How do I find out whether a specific building is exempt from Ontario's rent increase guideline?",
      },
      {
        id: "subletting",
        bullet:
          "Check the lease's subletting and assignment terms before signing, especially if your plans might change — not every lease allows it, and some require landlord approval.",
        askAdvisorPrompt:
          "What are my subletting rights in Ontario if my situation changes partway through the lease?",
      },
      {
        id: "guarantor",
        bullet:
          "Ask whether a guarantor or co-signer is required if you have no local credit history.",
        askAdvisorPrompt:
          "I have no local credit history — what can I offer instead of a guarantor?",
      },
    ],
  },
  {
    id: "documents",
    title: "Required Documents",
    criteria: [
      {
        id: "income-proof",
        bullet: "Proof of income — recent pay stubs, an offer letter, or equivalent.",
        askAdvisorPrompt:
          "What counts as acceptable proof of income for a Toronto landlord if I just started my job?",
      },
      {
        id: "bank-statements",
        bullet: "Recent bank statements showing available funds.",
        askAdvisorPrompt: "How many months of bank statements do landlords usually want to see?",
      },
      {
        id: "employment-letter",
        bullet: "An employment letter confirming your position, start date, and salary.",
        askAdvisorPrompt:
          "What should an employment letter include to satisfy a landlord's requirements?",
      },
      {
        id: "credit-score",
        bullet: "A credit score or credit report, where you have one available.",
        askAdvisorPrompt: "I have no Canadian credit score yet — what should I bring instead?",
      },
      {
        id: "background-check",
        bullet: "Be prepared for a background or reference check some landlords request.",
        askAdvisorPrompt: "What does a landlord background check in Ontario usually involve?",
      },
      {
        id: "government-id",
        bullet: "Government-issued photo ID.",
        askAdvisorPrompt:
          "Which forms of ID are accepted if I don't have a Canadian driver's licence yet?",
      },
      {
        id: "cosigner-info",
        bullet: "Co-signer or guarantor information, if you don't have local credit history.",
        askAdvisorPrompt: "What information does my co-signer need to provide to a landlord?",
      },
    ],
  },
  {
    id: "strategy",
    title: "Temporary vs. Long-Term Strategy",
    criteria: [
      {
        id: "initial-short-lease",
        bullet:
          "Consider an initial 3–6 month lease rather than committing to a full year right away — it buys time to finish job hunting, get your SIN and ID processing done, and actually evaluate the neighbourhood before locking in longer.",
        askAdvisorPrompt:
          "Does a short first lease make sense for my situation, or should I commit to a full year?",
      },
      {
        id: "reassess-at-renewal",
        bullet:
          "Use that shorter first lease to reassess before your next term — you'll have far more local knowledge to negotiate or choose differently the second time.",
        askAdvisorPrompt:
          "What should I be evaluating during my first short-term lease so I'm ready to decide at renewal?",
      },
    ],
  },
  {
    id: "negotiation",
    title: "Negotiation Opportunities",
    criteria: [
      {
        id: "long-listed",
        bullet:
          "A listing that's been active for a long time is a signal the landlord may be more open to negotiating on price or terms.",
        askAdvisorPrompt:
          "How can I tell if a listing has been sitting for a while, and how do I use that in a negotiation?",
      },
      {
        id: "older-building",
        bullet:
          "Older, independently-owned buildings tend to have more flexibility than large corporate-managed properties with fixed pricing.",
        askAdvisorPrompt:
          "How should I approach negotiating with an independent landlord versus a corporate management company?",
      },
      {
        id: "unstated-terms",
        bullet:
          "If a landlord hasn't stated firm lease-length or move-in requirements, that's often a sign there's room to negotiate them.",
        askAdvisorPrompt:
          "What's a reasonable way to ask a landlord for more flexible lease terms without souring the application?",
      },
    ],
  },
  {
    id: "application",
    title: "Application and Communication",
    criteria: [
      {
        id: "tenant-positioning",
        bullet:
          "Present yourself as a strong applicant: a complete document set upfront, a clear explanation of your income or guarantor situation, and a prompt, professional reply time all help you stand out.",
        askAdvisorPrompt:
          "How do I position myself as a strong applicant with no Canadian rental history?",
      },
      {
        id: "landlord-communication",
        bullet:
          "Keep landlord communication in writing where possible, and be direct about your move-in date and any conditions — clear communication reduces back-and-forth and signals reliability.",
        askAdvisorPrompt:
          "Can you help me write a first message to a landlord that comes across as reliable?",
      },
      {
        id: "standard-lease-check",
        bullet:
          "Before signing, check the lease terms against the Standard Form of Lease — Ontario requires most residential leases to use it, so anything that departs from it is worth a closer look.",
        askAdvisorPrompt:
          "What should I check for if a lease doesn't look like Ontario's Standard Form of Lease?",
      },
    ],
  },
];

/* ---------------------------------------------------------------------- */
/* 2.3 Verify the Place (Check the Place)                                  */
/* ---------------------------------------------------------------------- */

export type VerifyItem = { id: string; label: string };
export type VerifyGroup = { id: string; title: string; items: VerifyItem[] };

export const VERIFY_THE_PLACE_GROUPS: VerifyGroup[] = [
  {
    id: "documents",
    title: "Document Readiness",
    items: [
      {
        id: "bank",
        label:
          "Start a newcomer bank account application — some banks accept applications before you land.",
      },
      {
        id: "credit-sub",
        label:
          "Prepare proof of funds and credit-substitute documents: bank letters, an employment or admission letter, and translated references.",
      },
      {
        id: "pack",
        label:
          "Assemble your document pack before landing: passport, permit, offer or admission letter, proof of funds, and translated references.",
      },
      {
        id: "id",
        label:
          "Have two pieces of ID ready, including one photo ID, plus a void cheque or pre-authorized debit form.",
      },
    ],
  },
  {
    id: "verification",
    title: "Physical / Virtual Verification",
    items: [
      {
        id: "ownership",
        label:
          "Confirm the person you're dealing with is the owner or an authorized representative of the property.",
      },
      {
        id: "short-term-staging",
        label:
          "Watch for a specific pattern: someone renting a unit short-term (e.g. through Airbnb) purely to stage a convincing in-person showing, then collecting a deposit for a unit they have no long-term right to lease out. A real walkthrough is not proof the person can legally rent it to you.",
      },
      {
        id: "listing-auth",
        label:
          "Cross-check the listing against other posts for duplicated photos, prices, or descriptions.",
      },
      {
        id: "viewing",
        label: "View the unit in person or on a live video call before sending any money.",
      },
      {
        id: "no-wire",
        label:
          "Do not send a deposit or any payment by e-transfer or wire before a live viewing and a signed lease.",
      },
      {
        id: "lease-form",
        label: "Confirm the lease is the standard form used in your jurisdiction.",
      },
    ],
  },
];
