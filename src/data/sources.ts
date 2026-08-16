/**
 * Provenance registry for the small number of factual claims made in the static
 * reference lane (Column 2). Every citation points at a named source — nothing
 * here backs a listing, price, or address, since none of those appear in this app.
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
