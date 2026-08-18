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
  /** Short bold sub-header, e.g. "Entire Unit" — keeps each item scannable. */
  label: string;
  bullet: string;
  /** Optional secondary detail, rendered smaller/muted below the bullet. */
  note?: string;
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
    id: "living-setup",
    title: "Living Setup",
    criteria: [
      {
        id: "entire-unit",
        label: "Entire Unit",
        bullet: "Full privacy and control over your space.",
        note: "Landlords are legally responsible for building repairs and structural maintenance, while tenants pay rent and selected utility bills.",
        askAdvisorPrompt:
          "What's the difference between what a landlord must maintain and what I'm responsible for as a tenant?",
      },
    ],
  },
  {
    id: "costs",
    title: "Total Housing Costs",
    criteria: [
      {
        id: "rent-extras",
        label: "Rent & Extras",
        bullet:
          "Confirm which utilities (heat, hydro, water) are included in the rent, and budget separately for additional costs like internet, tenant insurance, and basic kitchen setup.",
        askAdvisorPrompt: "How do I figure out my true monthly housing cost beyond just the rent?",
      },
    ],
  },
  {
    id: "commute",
    title: "Commute & Transportation",
    criteria: [
      {
        id: "transit-vs-driving",
        label: "Transit vs. Driving",
        bullet:
          "Check proximity to subways/streetcars if taking public transit, or highway access if driving.",
        askAdvisorPrompt:
          "I'm not sure yet if I'll need a car — how should that affect where I look?",
      },
      {
        id: "winter-ttc-delays",
        label: "Winter & TTC Delays",
        bullet:
          "Account for outdoor wait times in winter, severe TTC delays, crowding during peak hours, and route detours.",
        askAdvisorPrompt: "How should I think about this commute differently once winter hits?",
      },
      {
        id: "rideshare-carpooling",
        label: "Rideshare / Carpooling",
        bullet:
          "Allow buffer time for carpool/rideshare apps — driver cancellations and inaccurate ETAs are common.",
        askAdvisorPrompt:
          "What should I account for if I'm planning to carpool or rely on rideshare instead of transit?",
      },
      {
        id: "bike-lanes",
        label: "Bike Lanes",
        bullet:
          "Ride on streets with dedicated bike lanes for safety (cycling on sidewalks is illegal).",
        askAdvisorPrompt:
          "Is cycling a realistic and safe commute option for this kind of route in Toronto?",
      },
    ],
  },
  {
    id: "lease-rent-control",
    title: "Lease Terms & Rent Control",
    criteria: [
      {
        id: "lease-strategy",
        label: "Lease Strategy",
        bullet:
          "Short-term or furnished housing lets newcomers explore neighborhoods before locking into a long-term lease.",
        askAdvisorPrompt:
          "Does a short first lease make sense for my situation, or should I commit to a full year?",
      },
      {
        id: "rent-control-limits",
        label: "Rent Control Limits",
        bullet:
          "Buildings first occupied after November 15, 2018, have NO cap on annual rent increases. Older buildings are subject to the annual city/provincial rent increase cap.",
        askAdvisorPrompt:
          "How do I find out whether a specific building is exempt from Ontario's rent increase guideline?",
      },
      {
        id: "credit-alternatives",
        label: "Credit Alternatives",
        bullet:
          "If lacking local credit history or a local job offer, stand out by offering a guarantor/co-signer, bank statements, or paying rent upfront.",
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
        id: "application-packet",
        label: "Application Packet",
        bullet:
          "Bring proof of income (pay stubs or offer letter) and recent bank statements showing sufficient funds.",
        askAdvisorPrompt:
          "What counts as acceptable proof of income for a Toronto landlord if I just started my job?",
      },
    ],
  },
  {
    id: "strategy",
    title: "Temporary vs. Long-Term Strategy",
    criteria: [
      {
        id: "initial-buffer",
        label: "Initial Buffer",
        bullet:
          "Consider a 3-to-6-month lease first to complete SIN/ID processing, job search, and neighborhood evaluation before committing to 12 months.",
        askAdvisorPrompt:
          "What should I be evaluating during a short first lease before I decide where to settle long-term?",
      },
    ],
  },
  {
    id: "negotiation",
    title: "Negotiation Strategy",
    criteria: [
      {
        id: "property-age",
        label: "Property Age",
        bullet: "Older properties typically offer more rent flexibility than brand-new builds.",
        askAdvisorPrompt:
          "How should I approach negotiating rent on an older building versus a new one?",
      },
      {
        id: "property-management",
        label: "Property Management",
        bullet:
          "Independently owned properties are usually more open to negotiation than corporate-managed complexes.",
        askAdvisorPrompt:
          "How should I approach negotiating with an independent landlord versus a corporate management company?",
      },
    ],
  },
  {
    id: "application",
    title: "Application & Communication",
    criteria: [
      {
        id: "landlord-priorities",
        label: "Landlord Priorities",
        bullet:
          "Frame your application around what landlords care about most: paying rent on time, taking care of the property, and avoiding long vacancies.",
        askAdvisorPrompt:
          "How do I position myself as a strong applicant with no Canadian rental history?",
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
