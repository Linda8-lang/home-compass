/**
 * SAMPLE DATA — newcomer immigration journey stages for the prototype.
 *
 * Each task declares how it is backed:
 *  - evidence: "reference" → factual/procedural information that should point at a source.
 *  - evidence: "guidance"  → general, non-authoritative guidance.
 * `citation` refers to a key in CITATIONS (src/data/sources.ts). When a reference
 * item has no citation yet, the UI shows "Source to be validated" — never invent one.
 */

export type JourneyStageId = "pre-landing" | "just-landed" | "settling";

export type JourneyTask = {
  label: string;
  detail: string;
  kind: "housing" | "admin" | "money" | "life";
  evidence: "reference" | "guidance";
  citation?: string;
};

export type JourneyStage = {
  id: JourneyStageId;
  name: string;
  window: string;
  summary: string;
  housingGoal: string;
  headsUp: string;
  tasks: JourneyTask[];
};

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "pre-landing",
    name: "Pre-landing",
    window: "Before you fly",
    summary:
      "You have no Canadian address, no credit file and no way to view a unit in person. Everything you sign now carries scam risk.",
    housingGoal:
      "Consider short-term housing rather than committing to a long lease from abroad. Use this stage to learn the market, not to commit.",
    headsUp:
      "Never e-transfer a deposit for a unit you have not seen on a live video call. This is where most newcomers lose money.",
    tasks: [
      {
        label: "Arrange temporary housing for your arrival",
        detail: "A furnished sublet or extended-stay place gives you a mailing address on day one.",
        kind: "housing",
        evidence: "guidance",
      },
      {
        label: "Shortlist a few neighbourhoods",
        detail: "Compare commute, rent range and safety before you can walk them yourself.",
        kind: "housing",
        evidence: "guidance",
      },
      {
        label: "Assemble your landlord document pack",
        detail: "Passport, permit, offer or admission letter, proof of funds, translated references.",
        kind: "admin",
        evidence: "reference",
      },
      {
        label: "Open a newcomer bank account remotely",
        detail:
          "Some banks let newcomers start an application from abroad. Requirements differ by bank, so check directly.",
        kind: "money",
        evidence: "reference",
      },
      {
        label: "Budget for landing costs",
        detail: "First + last month, transit pass, phone plan, furniture. Total landing costs vary widely.",
        kind: "money",
        evidence: "reference",
        citation: "depositRules",
      },
    ],
  },
  {
    id: "just-landed",
    name: "Just landed",
    window: "Your first weeks on the ground",
    summary:
      "You are in the city on temporary housing. The clock is on: you can now view units, but you still have no credit history.",
    housingGoal:
      "View in person, verify the listing, and sign a real lease before your short-term booking runs out.",
    headsUp:
      "Apply for your SIN early — landlords rarely ask for it, but employers and banks do, and it unblocks everything else.",
    tasks: [
      {
        label: "Get your SIN",
        detail: "Apply through Service Canada with your permit and passport. Processing times vary by office and channel.",
        kind: "admin",
        evidence: "reference",
      },
      {
        label: "Activate a Canadian phone number",
        detail: "Landlords screen out foreign numbers — a local number visibly raises your reply rate.",
        kind: "admin",
        evidence: "guidance",
      },
      {
        label: "Cluster your viewings",
        detail: "Cluster them by neighbourhood so you can compare the same day.",
        kind: "housing",
        evidence: "guidance",
      },
      {
        label: "Verify each shortlisted address",
        detail: "Run the fact sheet in the address verification section before you send any money or sign anything.",
        kind: "housing",
        evidence: "reference",
        citation: "safetyScore",
      },
      {
        label: "Get a secured credit card",
        detail: "Starts your Canadian credit file now so your next lease is far easier.",
        kind: "money",
        evidence: "guidance",
      },
      {
        label: "Apply for provincial health coverage",
        detail: "There can be a waiting period — start it the week you arrive.",
        kind: "life",
        evidence: "reference",
      },
    ],
  },
  {
    id: "settling",
    name: "Settling in",
    window: "After you have a lease",
    summary:
      "You have a lease. Now the goal shifts from getting approved to knowing your rights and lowering your costs.",
    housingGoal:
      "Understand your tenancy protections, build credit, and set up for a stronger renewal or next move.",
    headsUp:
      "In Ontario, rent increases on most units are capped by the annual guideline and need 90 days written notice. An above-guideline demand is not automatically valid.",
    tasks: [
      {
        label: "Know your tenancy rights",
        detail: "Rent increase limits, notice periods, repairs and entry rules all favour tenants here.",
        kind: "admin",
        evidence: "reference",
        citation: "tenancyRights",
      },
      {
        label: "Set up tenant insurance",
        detail: "Often required by the lease. Cost depends on your coverage and provider.",
        kind: "money",
        evidence: "reference",
      },
      {
        label: "Report rent payments to build credit",
        detail: "Rent-reporting services turn payments you already make into credit history.",
        kind: "money",
        evidence: "guidance",
      },
      {
        label: "Register with a local clinic",
        detail: "Family doctor waitlists are long — join one before you need it.",
        kind: "life",
        evidence: "guidance",
      },
      {
        label: "Plan your renewal 90 days out",
        detail: "Decide early whether to stay, renegotiate or move while you have leverage.",
        kind: "housing",
        evidence: "reference",
        citation: "rentIncreaseNotice",
      },
    ],
  },
];
