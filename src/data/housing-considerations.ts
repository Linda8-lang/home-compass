/**
 * Neutral, educational framework for evaluating housing.
 * No recommendations — these are the dimensions to think through,
 * plus the questions to ask yourself and the trade-offs that exist.
 */

export type ConsiderationCategory = {
  id: string;
  title: string;
  what: string;
  questions: string[];
  tradeoff: string;
};

export const HOUSING_CONSIDERATIONS: ConsiderationCategory[] = [
  {
    id: "housing-type",
    title: "Housing type",
    what:
      "Rentals differ by who manages them: purpose-built or managed buildings, owner-owned units, and rooms or shared homes.",
    questions: [
      "Who would you be signing with — a company or an individual?",
      "Is the unit self-contained, or are kitchen and bath shared?",
      "Is it furnished, and does that match how much you are bringing?",
    ],
    tradeoff:
      "More formal management usually means more paperwork and screening; less formal usually means less screening and less recourse.",
  },
  {
    id: "location",
    title: "Location",
    what:
      "Location determines your daily routine far more than the unit itself does — the same rent buys different amounts of space in different places.",
    questions: [
      "What does an ordinary weekday look like from this address?",
      "How does rent in this area compare with the areas next to it?",
      "What do you know about the area from data rather than from a listing description?",
    ],
    tradeoff: "Central areas tend to cost more per square foot; outer areas tend to cost more in travel time.",
  },
  {
    id: "cost",
    title: "Cost",
    what:
      "The advertised rent is only part of the monthly number. Utilities, internet, laundry, parking and insurance can all sit outside it.",
    questions: [
      "Which utilities are included, and which are billed separately?",
      "What is the total move-in cash requirement, not just the monthly rent?",
      "What share of your expected income would this be?",
    ],
    tradeoff: "A lower rent with excluded costs can end up higher than a higher all-inclusive rent.",
  },
  {
    id: "commute",
    title: "Commute & transportation",
    what:
      "Distance on a map and travel time are different things. Transit frequency, transfers and time of day all change the answer.",
    questions: [
      "How many transfers is the trip you would make most often?",
      "What does that trip cost per month?",
      "Would you need a car, and where would it be parked?",
    ],
    tradeoff: "Cheaper rent farther out is partly paid back in fares, time and flexibility.",
  },
  {
    id: "lease",
    title: "Lease requirements",
    what:
      "The lease sets the length of your commitment, how it ends, and what can change during it. Standard terms exist in Ontario.",
    questions: [
      "Is this a fixed term or month-to-month, and what happens at the end?",
      "What notice is required from each side?",
      "Who is responsible for repairs, and how are requests made?",
    ],
    tradeoff: "Longer fixed terms give price stability; shorter terms give the ability to move if the fit is wrong.",
  },
  {
    id: "documents",
    title: "Required documents",
    what:
      "Screening usually looks at identity, status, income and rental history. Newcomers often have some of these but not all.",
    questions: [
      "Which documents can you produce today, and which are still pending?",
      "What can stand in for a document you do not have yet?",
      "Is anything being asked of you that is unusual or not permitted?",
    ],
    tradeoff:
      "Being able to show more up front tends to speed things up; being asked for more than usual is worth questioning.",
  },
  {
    id: "duration",
    title: "Temporary vs. long-term housing",
    what:
      "Temporary housing buys time and an address; long-term housing buys stability and usually a lower monthly cost.",
    questions: [
      "How much do you still need to learn about the city before committing?",
      "What would it cost you to change your mind after signing?",
      "Do you have a date by which you need a permanent address?",
    ],
    tradeoff: "Short stays cost more per night but keep options open; long leases cost less per month but lock them in.",
  },
  {
    id: "proximity",
    title: "Proximity to work or school",
    what:
      "Whether you need to be close depends on how often you must physically be there and at what hours.",
    questions: [
      "How many days a week is the trip required?",
      "Are the hours ones when transit runs frequently?",
      "Would being farther away change whether you attend or participate?",
    ],
    tradeoff: "Closeness usually carries a rent premium; the value of it depends entirely on your schedule.",
  },
  {
    id: "necessities",
    title: "Daily necessities",
    what:
      "Groceries, pharmacies, clinics, laundry, banking and places of worship or community shape how liveable an address feels.",
    questions: [
      "What is within walking distance, and what needs a trip?",
      "Are the shops nearby ones you would actually use?",
      "What would you have to plan around rather than do casually?",
    ],
    tradeoff: "Fewer amenities nearby often means lower rent and more time spent travelling for ordinary errands.",
  },
];
