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
    id: "location",
    title: "Location",
    what: "Location determines your daily routine far more than the unit itself does — the same rent buys different amounts of space in different places.",
    questions: [
      "What does an ordinary weekday look like from this address?",
      "How does rent in this area compare with the areas next to it?",
      "What do you know about the area from data rather than from a listing description?",
    ],
    tradeoff:
      "Central areas tend to cost more per square foot; outer areas tend to cost more in travel time.",
  },
  {
    id: "cost",
    title: "Cost",
    what: "The advertised rent is only part of the monthly number, and it's also part of what you need on move-in day. This is the one place to work out your full number — no need to re-total it elsewhere.",
    questions: [
      "Which utilities are included, and which are billed separately?",
      "What is the total move-in cash requirement, not just the monthly rent?",
    ],
    tradeoff:
      "A lower rent with excluded costs can end up higher than a higher all-inclusive rent.",
  },
  {
    id: "other-costs",
    title: "Other costs people forget",
    what: "Renter's insurance, key and utility deposits, and — if the place is unfurnished — cookware and basic furniture all add to the real move-in number.",
    questions: ["Which of these does this specific place actually require?"],
    tradeoff:
      "An unfurnished place can look cheaper on paper and cost more in the first month once you furnish it.",
  },
  {
    id: "commute",
    title: "Commute",
    what: "The trip itself, not just the distance: winter waits outside, a subway that's too full to board so you wait for the next one, streetcar delays, carpool lines at peak hours. Bike lanes exist on some streets, not others — worth checking if you'd bike, since the city itself is flat enough to make it viable.",
    questions: ["How does this trip actually feel at 8am in January, not just on a map?"],
    tradeoff: "Cheaper rent farther out is partly paid back in travel time and daily friction.",
  },
  {
    id: "transportation",
    title: "Transportation access",
    what: "How convenient the area is to transit and highways, and how many options exist — one bus line is a different bet than a subway plus two streetcar routes.",
    questions: [
      "How many transit options serve this address, not just the closest stop?",
      "Would you need a car, and where would it be kept?",
    ],
    tradeoff: "Car-dependent areas often have lower rent but higher fixed transport costs.",
  },
  {
    id: "negotiation-room",
    title: "Spotting negotiation room",
    what: "Some signals suggest a listing has flexibility: older buildings, a posting that's been up a while, or a listing that never mentions a lease term. Even listings that state requirements plainly — credit check, no pets — are sometimes negotiable once you actually ask.",
    questions: [
      "How long has this been listed, and does the posting mention a lease term at all?",
      "Which stated 'requirements' are actually flexible if you ask?",
    ],
    tradeoff:
      "Asking costs nothing, but over-negotiating on a fresh, competitive listing can cost you the unit.",
  },
  {
    id: "lease",
    title: "Lease requirements",
    what: "Longer leases are usually cheaper per month. Newer condos often have no rent control — Ontario's rules exempt units first occupied after Nov 2018, so the cap depends on the building's age, not the lease itself. Some leases also restrict subletting — worth checking before you sign, not after.",
    questions: [
      "Is this fixed-term or month-to-month, and what happens at the end?",
      "Does the lease allow subletting, if your plans might change?",
    ],
    tradeoff: "Longer fixed terms give price stability; shorter terms keep your options open.",
  },
  {
    id: "documents",
    title: "What affects your eligibility",
    what: "Income, savings, a job or admission letter, co-signers, credit score, background check and ID all factor into how a landlord screens you. This is about what affects your competitiveness — the actual list of documents to submit lives in Application & Communication.",
    questions: ["Which of these can you show today, and which need a substitute?"],
    tradeoff:
      "Being able to show more up front tends to speed things up; being asked for more than usual is worth questioning.",
  },
  {
    id: "duration",
    title: "Temporary vs. long-term housing",
    what: "A 3–6 month lease first is often worth considering — it buys time to find permanent housing, get documents sorted, and learn the market, without locking in a full-year commitment right away.",
    questions: ["Do you have a hard date by which you need a permanent address?"],
    tradeoff:
      "Short stays cost more per night but keep options open; long leases cost less per month but lock them in.",
  },
  {
    id: "proximity",
    title: "Proximity to work or school",
    what: "Matters most if you're there most days, at hours when transit runs less often.",
    questions: ["How many days a week is the trip actually required?"],
    tradeoff:
      "Closeness usually carries a rent premium; its value depends entirely on your schedule.",
  },
  {
    id: "necessities",
    title: "Daily necessities",
    what: "Groceries, pharmacy and transit within walking distance shape how liveable a place feels day to day.",
    questions: ["What's actually within walking distance, versus what needs a trip?"],
    tradeoff:
      "Fewer amenities nearby often means lower rent and more time spent on ordinary errands.",
  },
];
