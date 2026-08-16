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
  { id: "compare", anchor: "compare-housing", eyebrow: "Compare Housing Options", title: "How to Evaluate" },
  { id: "verify", anchor: "verify-the-place", eyebrow: "Verify the Place", title: "Check the Place" },
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
  { name: "General listing sites", note: "Aggregate inventory spanning managed buildings and owner-listed units." },
  { name: "Community and neighbourhood groups", note: "Often used for rooms and sublets — verify identity before sending anything." },
  { name: "Room-share and roommate-matching apps", note: "Useful for matching on lifestyle before you know anyone in the city." },
  { name: "Municipal or settlement-agency housing help", note: "Free, non-commercial help desks that can point you to local rental resources." },
];

/** Shown only when persona === "Student". */
export const FIND_HOUSING_STUDENT_RESOURCES: ResourceLink[] = [
  { name: "University housing office", note: "Staff can review a lease and explain what's typical near campus." },
  { name: "Student union and program group chats", note: "Sublets from students leaving for a term — confirm the person is a current student before proceeding." },
];

/* ---------------------------------------------------------------------- */
/* 2.2 Compare Housing Options (How to Evaluate)                           */
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
    id: "cost",
    title: "Cost & Budgeting",
    criteria: [
      {
        id: "utilities",
        bullet: "Confirm which utilities — heat, hydro, water, internet — are included in the rent.",
        askAdvisorPrompt: "Which utilities are usually included in rent, and how should I confirm that before signing?",
      },
      {
        id: "deposits",
        bullet: "Ask exactly what deposits are being requested, and check that against local rules.",
        askAdvisorPrompt: "What deposits am I legally allowed to be asked for, and what should I do if a landlord asks for more?",
      },
      {
        id: "move-in-cost",
        bullet: "Total the full move-in cost — deposits, first month's rent, and setup costs — not just the advertised monthly rent.",
        askAdvisorPrompt: "Help me think through the full move-in cost I should budget for, beyond the monthly rent.",
      },
    ],
  },
  {
    id: "lease",
    title: "Lease Terms",
    criteria: [
      {
        id: "length",
        bullet: "Check the standard lease length on offer, and what options exist for a shorter or month-to-month term.",
        askAdvisorPrompt: "What lease lengths are typical, and what are the trade-offs of a shorter term?",
      },
      {
        id: "payment",
        bullet: "Confirm which rent payment methods are accepted and expected.",
        askAdvisorPrompt: "What rent payment methods are normal, and which requests should make me cautious?",
      },
      {
        id: "guarantor",
        bullet: "Ask whether a guarantor or co-signer is required if you have no local credit history.",
        askAdvisorPrompt: "I have no local credit history — what can I offer instead of a guarantor?",
      },
    ],
  },
  {
    id: "commute",
    title: "Commute & Location",
    criteria: [
      {
        id: "transit",
        bullet: "Check proximity to transit and typical service frequency, not just distance on a map.",
        askAdvisorPrompt: "How do I evaluate whether a location's transit access is actually good, beyond distance on a map?",
      },
      {
        id: "work-school",
        bullet: "Time the realistic door-to-door commute to work or school, including transfers.",
        askAdvisorPrompt: "What should I consider when comparing commute times between two places?",
      },
      {
        id: "errands",
        bullet: "Note walking distance to groceries and other daily essentials.",
        askAdvisorPrompt: "What nearby amenities should I check for before committing to a location?",
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
      { id: "bank", label: "Start a newcomer bank account application — some banks accept applications before you land." },
      { id: "credit-sub", label: "Prepare proof of funds and credit-substitute documents: bank letters, an employment or admission letter, and translated references." },
      { id: "pack", label: "Assemble your document pack before landing: passport, permit, offer or admission letter, proof of funds, and translated references." },
      { id: "id", label: "Have two pieces of ID ready, including one photo ID, plus a void cheque or pre-authorized debit form." },
    ],
  },
  {
    id: "verification",
    title: "Physical / Virtual Verification",
    items: [
      { id: "ownership", label: "Confirm the person you're dealing with is the owner or an authorized representative of the property." },
      { id: "listing-auth", label: "Cross-check the listing against other posts for duplicated photos, prices, or descriptions." },
      { id: "viewing", label: "View the unit in person or on a live video call before sending any money." },
      { id: "no-wire", label: "Do not send a deposit or any payment by e-transfer or wire before a live viewing and a signed lease." },
      { id: "lease-form", label: "Confirm the lease is the standard form used in your jurisdiction." },
    ],
  },
];
