/**
 * SAMPLE DATA — all content below is mock data for the Housing Assistant
 * prototype. Nothing here is fetched from a real API or verified source.
 */

export type NewcomerStatus = "student" | "job-offer" | "other";

/**
 * Two independent axes, not one flat list — who you're renting from is a
 * different question from how you're living. Deliberately no "risk" label
 * on either: we don't have data backing a risk ranking, so we don't assert one.
 */
export type OwnershipType = {
  id: string;
  title: string;
  price: string;
  creditNeeded: string;
  speed: string;
  blurb: string;
  bestFor: string;
};

export const OWNERSHIP_TYPES: OwnershipType[] = [
  {
    id: "managed",
    title: "Managed building",
    price: "$$$ — typically highest price",
    creditNeeded: "Credit check required",
    speed: "Timeline varies by market",
    blurb:
      "A property management company runs it. Standard leases, on-site staff, predictable process.",
    bestFor: "Best if you value certainty over price and have proof of funds.",
  },
  {
    id: "owner",
    title: "Individual owner",
    price: "$$ — often negotiable",
    creditNeeded: "Flexible, case-by-case",
    speed: "Timeline varies by landlord",
    blurb:
      "You're renting directly from the unit's owner. More room to negotiate — also more variance, since there's no standard process behind it.",
    bestFor: "Best if you can view in person and negotiate your own terms.",
  },
];

export type LivingArrangement = {
  id: string;
  title: string;
  price: string;
  creditNeeded: string;
  speed: string;
  blurb: string;
  bestFor: string;
};

export const LIVING_ARRANGEMENTS: LivingArrangement[] = [
  {
    id: "whole-unit",
    title: "Whole unit, alone",
    price: "Higher monthly cost",
    creditNeeded: "Full screening typical",
    speed: "Timeline varies",
    blurb: "You rent the entire place — your own lease, your own space.",
    bestFor: "Best if privacy matters more than price.",
  },
  {
    id: "rooms",
    title: "Rooms & shared",
    price: "$ — cheapest",
    creditNeeded: "Often no credit history needed",
    speed: "Often the fastest option",
    blurb: "You rent a room in a shared unit or house — a landing pad while you settle in.",
    bestFor: "Often used as a first step before signing a full lease.",
  },
];

export const SCAM_PATTERNS = [
  {
    title: "The 'Airbnb shown as a long-term rental' pattern",
    detail:
      "A real pattern reported recently: someone rents an Airbnb unit short-term just to show it as a rental listing, and takes a deposit on the spot. At move-in, the renter finds out it was only ever an Airbnb booking — never a real lease.",
  },
  {
    title: "Deposit requested before any viewing",
    detail:
      "No legitimate Toronto landlord needs money before you see the unit — in person or on a live video call.",
  },
  {
    title: "Price far below comparable units",
    detail:
      "A 1-bed at $1,100 in a $2,200 neighbourhood is bait. Compare against the neighbourhood averages in Stage 2.",
  },
  {
    title: "Landlord is 'abroad' and can't show the unit",
    detail: "Classic pattern: keys will be 'mailed' after an e-transfer. Walk away.",
  },
  {
    title: "Pressure to decide within hours",
    detail: "Urgency is a tactic. Real listings hold for at least a day for a qualified applicant.",
  },
];

// General resources — shown to everyone, regardless of whether they are a student.
export const POSTING_PLACES = [
  {
    name: "Major listing sites",
    note: "Best for managed buildings and verified inventory with photos and floorplans.",
  },
  {
    name: "Facebook housing groups",
    note: "Best for rooms and sublets — fastest replies, highest scam rate.",
  },
  {
    name: "Room-share apps",
    note: "Best for matching on lifestyle when you don't know anyone in the city yet.",
  },
  {
    name: "Local newcomer & diaspora groups",
    note: "Best for landlords who have rented to newcomers without local credit before.",
  },
  {
    name: "Municipal & settlement agency housing help",
    note: "Free, non-commercial help desks that can point you to local rental resources.",
  },
];

// Student-specific resources — only surfaced when the profile says the user is a student.
export const STUDENT_POSTING_PLACES = [
  {
    name: "University housing boards",
    note: "Postings are lightly screened and near campus; usually needs a student login.",
  },
  {
    name: "Campus off-campus housing office",
    note: "Staff can review a lease and explain what is normal near your campus.",
  },
  {
    name: "Student union & program group chats",
    note: "Sublets from students leaving for a term — verify the person is a current student.",
  },
];

export type Neighborhood = {
  id: string;
  name: string;
  rentLow: number;
  rentHigh: number;
  why: string;
  transitScore: number;
  safetyScore: number;
  commuteMins: number;
  vibe: string;
  needsSubway: boolean;
};

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: "annex",
    name: "The Annex",
    rentLow: 1750,
    rentHigh: 2400,
    why: "Walking distance to campus and dense with student sublets — the shortest commute of any option here.",
    transitScore: 94,
    safetyScore: 78,
    commuteMins: 9,
    vibe: "Student-heavy, leafy, older houses split into units",
    needsSubway: true,
  },
  {
    id: "junction",
    name: "The Junction",
    rentLow: 1500,
    rentHigh: 1950,
    why: "Best value per square foot on this list; owner-owned units here are the most open to negotiation.",
    transitScore: 71,
    safetyScore: 82,
    commuteMins: 34,
    vibe: "Quiet, low-rise, growing café strip",
    needsSubway: false,
  },
  {
    id: "leslieville",
    name: "Leslieville",
    rentLow: 1650,
    rentHigh: 2200,
    why: "Calm residential streets with strong grocery access, but you'll rely on streetcars rather than subway.",
    transitScore: 68,
    safetyScore: 86,
    commuteMins: 31,
    vibe: "Family-ish, east side, lots of small shops",
    needsSubway: false,
  },
  {
    id: "north-york",
    name: "North York Centre",
    rentLow: 1600,
    rentHigh: 2050,
    why: "Newer managed buildings directly on the subway line — the easiest option if you want a formal lease.",
    transitScore: 89,
    safetyScore: 84,
    commuteMins: 26,
    vibe: "High-rise, modern, very newcomer-friendly",
    needsSubway: true,
  },
  {
    id: "kensington",
    name: "Kensington & Chinatown",
    rentLow: 1450,
    rentHigh: 1900,
    why: "Cheapest rooms near downtown and the widest range of affordable groceries, with older housing stock.",
    transitScore: 85,
    safetyScore: 66,
    commuteMins: 14,
    vibe: "Busy, loud, extremely walkable",
    needsSubway: true,
  },
  {
    id: "danforth",
    name: "Danforth Village",
    rentLow: 1550,
    rentHigh: 2000,
    why: "Balanced pick: subway on the doorstep, quieter streets, and mid-range rents that rarely spike.",
    transitScore: 87,
    safetyScore: 83,
    commuteMins: 22,
    vibe: "Neighbourly, Greek food, mixed low-rise",
    needsSubway: true,
  },
];

export type Listing = {
  id: string;
  address: string;
  neighborhoodId: string;
  rent: number;
  type: string;
  daysListed: number;
  postingQuotes: { text: string; read: string; kind: "leverage" | "risk" | "neutral" }[];
};

export const LISTINGS: Listing[] = [
  {
    id: "l1",
    address: "412 Palmerston Blvd, Unit 2",
    neighborhoodId: "annex",
    rent: 1980,
    type: "Owner-owned 1-bed",
    daysListed: 47,
    postingQuotes: [
      {
        text: "Listed 47 days ago",
        read: "Well past the 21-day Toronto average. The owner is carrying an empty unit — that is your strongest lever.",
        kind: "leverage",
      },
      {
        text: '"Price negotiable for the right tenant"',
        read: "Explicit invitation. 'Right tenant' usually means low-hassle and financially provable, not highest bidder.",
        kind: "leverage",
      },
      {
        text: '"Flexible move-in, unit is vacant"',
        read: "A vacant unit costs the owner money every month. Ask for a mid-month start or a half-month free.",
        kind: "leverage",
      },
      {
        text: '"Credit check and references required"',
        read: "Standard, but this is where a newcomer stalls. Prepare substitutes before you contact them.",
        kind: "risk",
      },
    ],
  },
  {
    id: "l2",
    address: "88 Pacific Ave, Unit 5",
    neighborhoodId: "junction",
    rent: 1620,
    type: "Owner-owned 1-bed",
    daysListed: 12,
    postingQuotes: [
      {
        text: "Listed 12 days ago",
        read: "Fresh listing at a fair price — expect competition. Speed and completeness beat negotiation here.",
        kind: "neutral",
      },
      {
        text: '"First and last required"',
        read: "Standard in Ontario. Have the full amount liquid and say so in your first message.",
        kind: "risk",
      },
    ],
  },
  {
    id: "l3",
    address: "255 Danforth Ave, Unit 704",
    neighborhoodId: "danforth",
    rent: 1875,
    type: "Managed building 1-bed",
    daysListed: 29,
    postingQuotes: [
      {
        text: "Listed 29 days ago",
        read: "Slightly stale for a managed building. Rent is rarely flexible, but incentives often are.",
        kind: "leverage",
      },
      {
        text: '"Ask about our current promotion"',
        read: "Managed buildings discount with free months or waived locker/parking rather than lower rent.",
        kind: "leverage",
      },
    ],
  },
];

export type FactSheet = {
  address: string;
  neighborhoodId: string;
  listedRent: number;
  safety: { rating: string; tone: "good" | "fair" | "watch"; note: string };
  rents: { comparable: number; delta: string; note: string };
  essentials: { name: string; kind: string; walk: string }[];
  updated: string;
};

export const FACT_SHEETS: FactSheet[] = [
  {
    address: "412 Palmerston Blvd, Unit 2",
    neighborhoodId: "annex",
    listedRent: 1980,
    safety: {
      rating: "Generally safe",
      tone: "good",
      note: "12 reported incidents within 800m in the last 12 months, mostly property crime (bike and package theft). No trend increase year over year.",
    },
    rents: {
      comparable: 2120,
      delta: "7% below market",
      note: "Comparable 1-beds within 500m rented for $1,940–$2,300 in the last 6 months. This listing sits at the low end.",
    },
    essentials: [
      { name: "Fiesta Farms", kind: "Full grocery", walk: "8 min walk" },
      { name: "Metro Bathurst", kind: "Grocery, open late", walk: "11 min walk" },
      { name: "Shoppers Drug Mart", kind: "Pharmacy", walk: "6 min walk" },
      { name: "Bathurst Station", kind: "Subway (Line 2)", walk: "7 min walk" },
    ],
    updated: "Sample data · refreshed Mar 2026",
  },
  {
    address: "88 Pacific Ave, Unit 5",
    neighborhoodId: "junction",
    listedRent: 1620,
    safety: {
      rating: "Very safe",
      tone: "good",
      note: "6 reported incidents within 800m in the last 12 months. Residential street, low overnight activity.",
    },
    rents: {
      comparable: 1690,
      delta: "4% below market",
      note: "Comparable 1-beds nearby rented for $1,550–$1,850. Priced fairly, not a bargain.",
    },
    essentials: [
      { name: "No Frills Dundas W", kind: "Budget grocery", walk: "9 min walk" },
      { name: "Junction Farmers Market", kind: "Weekend market", walk: "12 min walk" },
      { name: "Rexall", kind: "Pharmacy", walk: "7 min walk" },
      { name: "Dundas West 40 bus", kind: "Bus to subway", walk: "4 min walk" },
    ],
    updated: "Sample data · refreshed Mar 2026",
  },
  {
    address: "255 Danforth Ave, Unit 704",
    neighborhoodId: "danforth",
    listedRent: 1875,
    safety: {
      rating: "Mixed — main street",
      tone: "fair",
      note: "28 reported incidents within 800m in the last 12 months, concentrated on the commercial strip after 11pm. Side streets report far fewer.",
    },
    rents: {
      comparable: 1810,
      delta: "4% above market",
      note: "Comparable units in the same building rented for $1,760–$1,890. You are paying slightly over for the higher floor.",
    },
    essentials: [
      { name: "Loblaws Danforth", kind: "Full grocery", walk: "5 min walk" },
      { name: "Sun Valley Fine Foods", kind: "Produce & deli", walk: "8 min walk" },
      { name: "Pharmasave", kind: "Pharmacy", walk: "3 min walk" },
      { name: "Chester Station", kind: "Subway (Line 2)", walk: "4 min walk" },
    ],
    updated: "Sample data · refreshed Mar 2026",
  },
];

export const LANDLORD_CHECKLIST: Record<
  NewcomerStatus,
  { need: string; youHave: string; substitute: string; strength: "strong" | "medium" }[]
> = {
  student: [
    {
      need: "Canadian credit report",
      youHave: "None yet — you arrive in August",
      substitute:
        "Offer a bank letter showing tuition + living funds, plus your home-country credit report translated.",
      strength: "medium",
    },
    {
      need: "Proof of steady income",
      youHave: "No Canadian employer",
      substitute:
        "Your admission letter plus a funding/scholarship letter reads as guaranteed income to most landlords.",
      strength: "strong",
    },
    {
      need: "Canadian references",
      youHave: "No local network",
      substitute:
        "A university housing office contact or a previous landlord's letter (translated) works as a stand-in.",
      strength: "medium",
    },
    {
      need: "Confidence you'll pay on time",
      youHave: "Savings for the year",
      substitute:
        "Offer a guarantor, or first + last upfront. Paying beyond the legal deposit maximum is not enforceable in Ontario, so extra offers carry no protection.",
      strength: "strong",
    },
  ],
  "job-offer": [
    {
      need: "Canadian credit report",
      youHave: "None yet — arriving for a new role",
      substitute:
        "Signed employment offer with salary + start date replaces credit for most owner-landlords.",
      strength: "strong",
    },
    {
      need: "Proof of steady income",
      youHave: "Offer letter, no pay stubs yet",
      substitute:
        "Ask HR for an employment verification letter on letterhead — landlords weight this heavily.",
      strength: "strong",
    },
    {
      need: "Canadian references",
      youHave: "No local network",
      substitute: "Your hiring manager or HR contact can serve as a character reference.",
      strength: "medium",
    },
    {
      need: "Confidence you'll pay on time",
      youHave: "Salary starting soon",
      substitute:
        "Proof of funds bridges the gap until your first pay cycle. How much is enough varies by landlord.",
      strength: "medium",
    },
  ],
  other: [
    {
      need: "Canadian credit report",
      youHave: "None yet",
      substitute: "Home-country credit report plus bank statements showing consistent balances.",
      strength: "medium",
    },
    {
      need: "Proof of steady income",
      youHave: "Varies",
      substitute:
        "Proof of funds is often the strongest single document; the amount landlords ask for varies.",
      strength: "strong",
    },
    {
      need: "Canadian references",
      youHave: "No local network",
      substitute: "A previous landlord letter, translated and with contact details, is acceptable.",
      strength: "medium",
    },
    {
      need: "Confidence you'll pay on time",
      youHave: "Savings",
      substitute: "A Canadian guarantor is the fastest unlock if anyone in your network qualifies.",
      strength: "strong",
    },
  ],
};

export const DOC_PATHS: Record<
  NewcomerStatus,
  { label: string; speed: string; rank: number; why: string }[]
> = {
  student: [
    {
      label: "Guarantor agreement (Canadian co-signer)",
      speed: "Often accepted quickly",
      rank: 1,
      why: "Transfers the risk off you entirely — landlords stop asking about credit once this is signed.",
    },
    {
      label: "Proof of funds: bank letter covering your rent",
      speed: "Acceptance time varies",
      rank: 2,
      why: "A single official letter is easier for a landlord to trust than a stack of statements.",
    },
    {
      label: "Admission + funding letter package",
      speed: "Sometimes needs a follow-up call",
      rank: 3,
      why: "Convincing for landlords near campus, less so for downtown managed buildings.",
    },
  ],
  "job-offer": [
    {
      label: "Signed employment offer + HR verification letter",
      speed: "Often accepted quickly",
      rank: 1,
      why: "Salary and start date on letterhead is the closest substitute to a pay stub.",
    },
    {
      label: "Proof of funds: liquid savings for rent",
      speed: "Acceptance time varies",
      rank: 2,
      why: "Covers the gap between move-in and your first Canadian paycheque.",
    },
    {
      label: "Home-country pay stubs + reference letter",
      speed: "Often needs explaining",
      rank: 3,
      why: "Useful as backup, but foreign currency and formats slow landlords down.",
    },
  ],
  other: [
    {
      label: "Proof of funds: liquid savings for rent",
      speed: "Often accepted quickly",
      rank: 1,
      why: "Removes the income question completely for the length of the lease.",
    },
    {
      label: "Canadian guarantor",
      speed: "Acceptance time varies",
      rank: 2,
      why: "Strong, but depends on finding someone willing to co-sign.",
    },
    {
      label: "Home-country credit report + landlord letter",
      speed: "Slowest — expect questions",
      rank: 3,
      why: "Landlords can't verify it independently, so it only supports a stronger document.",
    },
  ],
};

export const BASE_DOCS = [
  "Passport photo page",
  "Study permit / work permit or visa",
  "Completed rental application form",
  "Two pieces of ID (one photo)",
  "Void cheque or pre-authorized debit form",
];

export const PAYMENT_NOTES = [
  {
    title: "First + last month's rent",
    detail:
      "Ontario's legal maximum deposit. Last month's rent is a deposit, not a fee — it pays your final month.",
  },
  {
    title: "No 'damage deposit' in Ontario",
    detail:
      "If a landlord asks for a separate damage or cleaning deposit, that's a red flag, not a norm.",
  },
  {
    title: "Key deposit is allowed",
    detail: "Refundable and limited to the actual replacement cost of the key — usually $20–$100.",
  },
  {
    title: "Rent is typically due the 1st",
    detail:
      "Most landlords ask for pre-authorized debit or e-transfer. Always keep a receipt or transfer record.",
  },
];

// Housing > Renting > "moving-in/setup basics" per the Moving Assistant UX
// doc — the step after signing, before the Application Prep / Checklist
// screens. Kept small and additive; some of these (utilities, address
// change) will likely get a fuller home once Daily Needs/Finance
// categories exist — this is the Housing-scoped version for now.
export const MOVE_IN_BASICS = [
  {
    title: "Set up utilities before move-in day",
    detail:
      "Hydro, gas and internet often need a few business days' lead time. Don't leave this for move-in morning.",
  },
  {
    title: "Do a move-in walkthrough first",
    detail:
      "Photograph any existing damage or wear before you unpack anything — this protects your deposit later.",
  },
  {
    title: "Confirm keys, fobs and parking in writing",
    detail:
      "Get an exact count of what you're receiving, and where parking (if included) actually is.",
  },
  {
    title: "Activate renter's insurance on or before move-in",
    detail:
      "Many leases require proof of coverage starting the day you take possession, not after.",
  },
  {
    title: "Update your address",
    detail:
      "Bank, employer/school, and government services (health card, driver's licence) all need the new address — most can be done online.",
  },
];
