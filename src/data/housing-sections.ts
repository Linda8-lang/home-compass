import { Calendar, Briefcase, Home, Building2, Key, Users, GraduationCap, Zap, Wifi, ShieldCheck, Package, type LucideIcon } from "lucide-react";

/**
 * Static reference data for the Housing section's Column 2 (Static Reference Lane).
 *
 * Exactly three collapsible sections, matching the approved scope:
 *   1. Find Housing      — duration and housing-type cards (no risk ratings or timelines)
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
/* 2.1 Find Housing — duration cards + housing-type cards                  */
/* ---------------------------------------------------------------------- */

export type HousingChoiceCard = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  /** Only rendered when the active persona is Student. */
  studentOnly?: boolean;
};

/** Group 1 — "Find the duration that suits your needs". Each has a resource list (see durationResources). */
export const DURATION_CARDS: HousingChoiceCard[] = [
  {
    id: "temporary",
    icon: Calendar,
    title: "Temporary (days - weeks)",
    description: "Best for very short stays. High flexibility. Higher nightly rates.",
  },
  {
    id: "short-term",
    icon: Briefcase,
    title: "Short-term (1-6 months)",
    description: "Best for extended stays with flexibility. Good for transition periods.",
  },
  {
    id: "long-term",
    icon: Home,
    title: "Long-term (6+ months)",
    description: "Best for stability and better rates. Ideal for settling down.",
  },
];

/** Group 2 — "Find the type of housing that suits your needs". Strictly these four — the fourth is persona-gated. */
export const HOUSING_TYPE_CARDS: HousingChoiceCard[] = [
  {
    id: "managed",
    icon: Building2,
    title: "Managed Buildings",
    description: "Rent from property management companies.",
  },
  {
    id: "owner",
    icon: Key,
    title: "Owner-owned units",
    description: "Rent directly from landlords or owners.",
  },
  {
    id: "rooms",
    icon: Users,
    title: "Rooms & shared housing",
    description: "Share space and costs with others.",
  },
  {
    id: "university",
    icon: GraduationCap,
    title: "University housing boards",
    description:
      "Off-campus listing boards and housing offices run by a university, generally restricted to students with a current login.",
    studentOnly: true,
  },
];

export type HousingResource = {
  name: string;
  url: string;
  description: string;
};

export type DurationResources = {
  id: "temporary" | "short-term" | "long-term";
  resources: HousingResource[];
};

/** Resource lists shown in the "Learn more" detail view for each duration card. */
export const durationResources: DurationResources[] = [
  {
    id: "temporary",
    resources: [
      {
        name: "Toronto Shelter System",
        url: "https://www.toronto.ca/community-people/housing-shelter/",
        description: "Emergency housing and relief services for immediate shelter needs",
      },
      {
        name: "Hostelworld",
        url: "https://www.hostelworld.com",
        description: "Budget hostel accommodations suitable for short initial stays.",
      },
      {
        name: "Blueground Toronto",
        url: "https://www.theblueground.com/furnished-apartments-toronto",
        description: "Furnished apartments with flexible stays.",
      },
      {
        name: "Airbnb",
        url: "https://www.airbnb.ca",
        description: "Short-term residential rentals booked directly with local home hosts",
      },
      {
        name: "Trivago",
        url: "https://www.trivago.ca",
        description: "Hotel price comparison platform",
      },
      {
        name: "Expedia",
        url: "https://www.expedia.ca",
        description: "Travel booking platform for hotels and short stays.",
      },
      {
        name: "Booking.com",
        url: "https://www.booking.com",
        description: "Booking platform for hotels and temporary accommodation.",
      },
      {
        name: "Hotels.com",
        url: "https://ca.hotels.com",
        description: "Hotel booking platform.",
      },
      {
        name: "Trip.com",
        url: "https://www.trip.com",
        description: "Hotel and accommodation booking platform",
      },
      {
        name: "Priceline",
        url: "https://www.priceline.com",
        description: "Discount travel service offering hotel room deals and bookings.",
      },
    ],
  },
  {
    id: "short-term",
    resources: [
      {
        name: "Happipad",
        url: "https://www.happipad.com",
        description: "Home-sharing platform connecting renters with hosts.",
      },
      {
        name: "Roomies",
        url: "https://www.roomies.ca",
        description: "Shared housing and room rentals.",
      },
      {
        name: "Zumper",
        url: "https://www.zumper.com",
        description: "Rental marketplace with short-term and furnished options.",
      },
      {
        name: "Craigslist Sublets",
        url: "https://www.craigslist.org/search/area/toronto?cat=sub#search=2~gallery~0",
        description: "Peer-to-peer sublets and temporary rentals.",
      },
      {
        name: "Facebook Marketplace",
        url: "https://www.facebook.com/marketplace",
        description: "Peer-to-peer rooms, sublets, and lease takeovers.",
      },
    ],
  },
  {
    id: "long-term",
    resources: [
      {
        name: "Rentals.ca",
        url: "https://rentals.ca",
        description: "Canadian rental marketplace for apartments and homes.",
      },
      {
        name: "Realtor.ca",
        url: "https://www.realtor.ca",
        description: "Real estate portal with agent-listed rental properties.",
      },
      {
        name: "PadMapper",
        url: "https://www.padmapper.com",
        description: "Map-based rental search tool.",
      },
      {
        name: "liv.rent",
        url: "https://www.liv.rent",
        description: "Rental platform with landlord and listing verification features.",
      },
      {
        name: "Apartments.com",
        url: "https://www.apartments.com",
        description: "Large database of apartment rentals.",
      },
      {
        name: "Viewit.ca",
        url: "https://www.viewit.ca",
        description: "Apartment rental directory, especially useful for managed buildings.",
      },
      {
        name: "RentSeeker",
        url: "https://www.rentseeker.ca",
        description: "Rental listings for apartments and multi-family buildings.",
      },
      {
        name: "4Rent.ca",
        url: "https://www.4rent.ca",
        description: "Listings for apartments and managed rental buildings.",
      },
      {
        name: "Condos.ca",
        url: "https://condos.ca",
        description: "Toronto condo rental listings.",
      },
      {
        name: "Strata.ca",
        url: "https://www.strata.ca",
        description: "Condo rental and real estate listings.",
      },
      {
        name: "HouseSigma",
        url: "https://housesigma.com",
        description: "Real estate data and property listings, including rentals.",
      },
      {
        name: "Property.ca",
        url: "https://www.property.ca",
        description: "Real estate platform with residential rental listings.",
      },
      {
        name: "Kijiji Real Estate",
        url: "https://www.kijiji.ca/h-real-estate/108",
        description: "Classified listings including private landlord rentals.",
      },
    ],
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
  askAdvisorPrompt?: string;
};

export type CriterionGroup = {
  id: string;
  title: string;
  criteria: EvaluationCriterion[];
};

export type CostBreakdownItem = {
  label: string;
  icon: LucideIcon;
  default: number; // default amount in CAD
  isVariable?: boolean; // rent=true, others=false
};

/** Cost breakdown items for the interactive calculator. */
export const COST_BREAKDOWN_ITEMS: CostBreakdownItem[] = [
  {
    label: "Rent (Base)",
    icon: Home,
    default: 2000,
    isVariable: true,
  },
  {
    label: "Utilities (Heat, Hydro, Water)",
    icon: Zap,
    default: 150,
    isVariable: false,
  },
  {
    label: "Internet",
    icon: Wifi,
    default: 60,
    isVariable: false,
  },
  {
    label: "Renter's Insurance",
    icon: ShieldCheck,
    default: 25,
    isVariable: false,
  },
  {
    label: "Misc (Furniture, Supplies)",
    icon: Package,
    default: 120,
    isVariable: false,
  },
];

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
        note: "Use the breakdown below to estimate your true monthly housing cost. Actual amounts vary by building, location, and personal choices.",
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
