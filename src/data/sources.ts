/**
 * SAMPLE DATA — mock multi-source provenance registry. Every number shown in the
 * prototype points at 2–3 named sources so the user can see where it came from.
 */

export type Source = {
  id: string;
  name: string;
  org: string;
  kind: "Open government" | "Market records" | "Transit authority" | "Field survey" | "Regulator";
  updated: string;
  cadence: string;
};

export const SOURCES: Record<string, Source> = {
  police: {
    id: "police",
    name: "Neighbourhood Crime Open Data",
    org: "Toronto Police Service",
    kind: "Open government",
    updated: "Feb 2026",
    cadence: "Updated monthly",
  },
  cityStats: {
    id: "cityStats",
    name: "Ward Profiles & Wellbeing Index",
    org: "City of Toronto Open Data",
    kind: "Open government",
    updated: "Jan 2026",
    cadence: "Updated quarterly",
  },
  cmhc: {
    id: "cmhc",
    name: "Rental Market Survey",
    org: "CMHC",
    kind: "Market records",
    updated: "Oct 2025",
    cadence: "Updated annually",
  },
  leases: {
    id: "leases",
    name: "Closed-lease transaction records",
    org: "Regional listing board",
    kind: "Market records",
    updated: "Mar 2026",
    cadence: "Updated weekly",
  },
  listings: {
    id: "listings",
    name: "Active listing aggregate",
    org: "Multi-portal scrape",
    kind: "Market records",
    updated: "Mar 2026",
    cadence: "Updated daily",
  },
  ttc: {
    id: "ttc",
    name: "Route & headway feed (GTFS)",
    org: "Toronto Transit Commission",
    kind: "Transit authority",
    updated: "Mar 2026",
    cadence: "Updated weekly",
  },
  fieldWalk: {
    id: "fieldWalk",
    name: "Walk-time field survey",
    org: "Housing Assistant team",
    kind: "Field survey",
    updated: "Feb 2026",
    cadence: "Re-walked twice a year",
  },
  ltb: {
    id: "ltb",
    name: "Residential Tenancies Act guidance",
    org: "Landlord and Tenant Board",
    kind: "Regulator",
    updated: "Jan 2026",
    cadence: "Updated on legislation change",
  },
};

export type Citation = {
  label: string;
  sourceIds: string[];
  agreement: "Sources agree" | "Minor variance" | "Sources disagree";
  note: string;
};

export const CITATIONS: Record<string, Citation> = {
  neighborhoodRent: {
    label: "Neighbourhood rent range",
    sourceIds: ["cmhc", "leases", "listings"],
    agreement: "Minor variance",
    note: "Asking rents in the active-listing feed run 3–6% above closed leases. We show the closed-lease range and treat asking prices as the ceiling.",
  },
  transitScore: {
    label: "Transit & commute time",
    sourceIds: ["ttc", "fieldWalk"],
    agreement: "Sources agree",
    note: "Commute minutes are the scheduled off-peak trip from the GTFS feed plus a measured walk to the stop. Peak times can run 15% longer.",
  },
  safetyScore: {
    label: "Safety score",
    sourceIds: ["police", "cityStats"],
    agreement: "Minor variance",
    note: "Reported-incident density is normalised per 1,000 residents. Reporting rates differ by area, so treat this as a comparison tool, not an absolute.",
  },
  listedRentDelta: {
    label: "Price vs. market",
    sourceIds: ["leases", "listings"],
    agreement: "Sources agree",
    note: "Compared against closed leases for similar unit types within 500m over the last six months.",
  },
  essentials: {
    label: "Groceries & essentials",
    sourceIds: ["fieldWalk", "cityStats"],
    agreement: "Sources agree",
    note: "Walk times were measured on foot, not estimated from straight-line distance.",
  },
  depositRules: {
    label: "Deposit & rent rules",
    sourceIds: ["ltb"],
    agreement: "Sources agree",
    note: "Ontario allows first and last month's rent plus a refundable key deposit. Damage deposits are not permitted.",
  },
  tenancyRights: {
    label: "Tenancy rights & obligations",
    sourceIds: ["ltb"],
    agreement: "Sources agree",
    note: "Entry notice, repair responsibility and eviction grounds come from the Residential Tenancies Act as summarised by the Landlord and Tenant Board.",
  },
  rentIncreaseNotice: {
    label: "Rent increase notice period",
    sourceIds: ["ltb"],
    agreement: "Sources agree",
    note: "Most units require 90 days written notice of a rent increase, and increases are limited by the annual provincial guideline.",
  },
};
