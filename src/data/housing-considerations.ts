/**
 * Neutral, educational framework for evaluating housing.
 * No recommendations — dimensions to think through, things to consider,
 * the trade-off behind them, and Toronto-specific local notes.
 */

export type ConsiderationCategory = {
  id: string;
  title: string;
  what: string;
  questions: string[];
  tradeoff: string;
  local?: string[];
};

export const HOUSING_CONSIDERATIONS: ConsiderationCategory[] = [
  {
    id: "management",
    title: "Management type",
    what: "Who you sign with: a management company or an individual owner.",
    questions: [
      "Is the landlord a company or a private individual?",
      "Who handles repairs, and how are requests logged?",
      "Is the lease the standard Ontario form?",
    ],
    tradeoff:
      "Companies mean more screening and more process; individual owners mean more flexibility and less recourse.",
    local: [
      "Older, individually owned buildings are usually the most open to negotiation.",
      "Listings up for a long time signal an owner carrying an empty unit.",
    ],
  },
  {
    id: "occupancy",
    title: "Occupancy type",
    what: "What you actually get: an entire unit, or a room in a shared home.",
    questions: [
      "Is the kitchen or bathroom shared?",
      "Is it furnished?",
      "Who else is on the lease?",
    ],
    tradeoff: "Shared rooms cost less and move faster; entire units cost more and give you control.",
  },
  {
    id: "cost",
    title: "Cost",
    what: "Advertised rent is only part of the monthly and move-in number.",
    questions: [
      "Which utilities are included?",
      "What is the total move-in cash requirement?",
      "What share of your income is this?",
    ],
    tradeoff: "Low rent with excluded costs can end up above a higher all-inclusive rent.",
    local: [
      "Budget beyond rent: key deposit, utility account deposits, renter's insurance (often required), internet setup.",
      "First-apartment costs add up: utensils, cookware, bedding, a shower curtain.",
      "Rent control: units in buildings first occupied after Nov 15, 2018 are exempt from Ontario's annual increase cap.",
    ],
  },
  {
    id: "commute",
    title: "Commute",
    what: "Map distance and travel time are different things.",
    questions: [
      "How long is the trip you make most often, door to door?",
      "How many transfers, and how reliable off-peak?",
      "What does that trip look like in February?",
    ],
    tradeoff: "Cheaper rent farther out is paid back in travel time.",
    local: [
      "Winter storms add delays; surface routes slow down more than the subway.",
      "Peak-hour subway and streetcars are crowded — you may wait for a second vehicle.",
      "Protected bike lanes are uneven across the city; check the route, not just the distance.",
    ],
  },
  {
    id: "transportation",
    title: "Transportation",
    what: "Fares, bike routes, parking or car ownership are a monthly cost.",
    questions: [
      "What would you spend monthly on fares, fuel or parking?",
      "Is frequent transit within walking distance?",
      "Would you need a car, and where would it live?",
    ],
    tradeoff: "Car-dependent areas have lower rent but higher fixed transport costs.",
  },
  {
    id: "lease",
    title: "Lease requirements",
    what: "Term, deposits, and what the landlord can and cannot ask for.",
    questions: [
      "How long is the term, and what happens at the end?",
      "What deposits are being requested?",
      "What are the rules on guests, subletting and ending early?",
    ],
    tradeoff: "Longer terms trade flexibility for stability.",
    local: [
      "A 3–6 month or month-to-month start is a common strategy while you build local ID, banking and references.",
      "Ontario deposits are limited to first and last month's rent, plus a refundable key deposit.",
    ],
  },
  {
    id: "documents",
    title: "Application and communication",
    what: "What you can show, and how you present it.",
    questions: [
      "Which documents can you produce today?",
      "What can stand in for the ones you cannot?",
      "Is anything being asked that is not permitted?",
    ],
    tradeoff: "Showing more up front speeds things up; unusual requests are worth questioning.",
    local: [
      "Commonly requested: photo ID, proof of income (employment letter, pay stubs or T4), credit score or report, references, void cheque.",
      "No Canadian credit yet? Offer a guarantor, proof of funds, or an employment/admission letter instead.",
    ],
  },
  {
    id: "duration",
    title: "Temporary vs. long-term",
    what: "Temporary buys time and an address; long-term buys stability.",
    questions: [
      "How much do you still need to learn about the city?",
      "What would changing your mind cost after signing?",
      "When do you need a permanent address?",
    ],
    tradeoff: "Short stays cost more per night but keep options open.",
  },
  {
    id: "location",
    title: "Location",
    what: "Location shapes your routine more than the unit does.",
    questions: [
      "What does an ordinary weekday look like from here?",
      "How does rent compare with the areas next to it?",
      "What is walkable, and what needs a trip?",
    ],
    tradeoff: "Central areas cost more per square foot; outer areas cost more in travel time.",
  },
];
