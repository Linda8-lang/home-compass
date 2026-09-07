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
  url: string;
};

export const SOURCES: Record<string, Source> = {
  ltb: {
    id: "ltb",
    name: "Residential Tenancies Act guidance",
    org: "Landlord and Tenant Board",
    kind: "Regulator",
    updated: "Jan 2026",
    cadence: "Updated on legislation change",
    url: "https://tribunalsontario.ca/documents/ltb/Brochures/A%20Guide%20to%20the%20Residential%20Tenancies%20Act.html",
  },
  ontarioStandardLease: {
    id: "ontarioStandardLease",
    name: "Guide to Ontario's Standard Lease",
    org: "Government of Ontario",
    kind: "Open government",
    updated: "Jan 2026",
    cadence: "Updated on legislation change",
    url: "https://www.ontario.ca/page/guide-ontarios-standard-lease",
  },
  ohrcRentalPolicy: {
    id: "ohrcRentalPolicy",
    name: "Policy on Human Rights and Rental Housing",
    org: "Ontario Human Rights Commission",
    kind: "Regulator",
    updated: "Jan 2026",
    cadence: "Updated on policy revision",
    url: "https://www.ohrc.on.ca/en/policy-human-rights-and-rental-housing",
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
    // The standard lease guide explains the same rent-deposit rule as part of the
    // mandatory lease template, so it's cited alongside the LTB here.
    sourceIds: ["ltb", "ontarioStandardLease"],
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
  discriminationProtections: {
    label: "Discrimination protections in rental housing",
    sourceIds: ["ohrcRentalPolicy"],
    agreement: "Sources agree",
    note: "Ontario's Human Rights Code prohibits landlords from refusing an applicant, imposing different terms, or ending a tenancy based on protected grounds such as race, family status, disability, sex, or receipt of public assistance.",
  },
};
