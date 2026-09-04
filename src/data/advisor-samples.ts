export type SampleTurn = { role: "user" | "assistant"; content: string };

export type SampleConversation = {
  id: string;
  label: string;
  blurb: string;
  turns: SampleTurn[];
  /** What the advisor still has to learn before it can answer usefully. */
  stillMissing: string[];
};

/**
 * Realistic sample conversation states used to demonstrate the advisor's
 * progressive clarifying-question behaviour. They are illustrative transcripts,
 * not curated recommendations, and contain no invented listings or prices.
 */
export const SAMPLE_CONVERSATIONS: SampleConversation[] = [
  {
    id: "near-university",
    label: "Housing near my university",
    blurb: "Broad request → one question at a time",
    stillMissing: ["Move-in date", "Temporary vs. long-term"],
    turns: [
      { role: "user", content: "Can you help me find housing near my university?" },
      {
        role: "assistant",
        content:
          "You're pre-landing and budgeting $2,000/month in Toronto.\n\nA few things I still need:\n1. University or campus (e.g., UofT St. George vs. Scarborough)\n2. Priority (e.g., shorter commute vs. lower rent)\n3. Move-in timing (e.g., temporary for now vs. a full lease from the start)",
      },
      {
        role: "user",
        content: "University of Toronto, St. George campus. Around $1,500. I'd rather not travel more than 30 minutes.",
      },
      {
        role: "assistant",
        content:
          "Got it — St. George, about $1,500, up to 30 minutes door to door.\n\nOne more thing before I go further: are you looking for something short-term while you settle, or a full lease from the start? That changes where you should be searching and which documents you'll be asked for.",
      },
    ],
  },
  {
    id: "arriving-with-family",
    label: "Arriving with my family",
    blurb: "Constraints first, then trade-offs",
    stillMissing: ["Budget range", "Work location"],
    turns: [
      { role: "user", content: "We arrive in Toronto next month with two kids. Where should we live?" },
      {
        role: "assistant",
        content:
          "You're arriving in Toronto next month as a family of four. I can't point you at specific places — I have no listing database and won't invent addresses or prices — but I can help you work out what to compare.\n\nA few things I still need:\n1. Work or study location (e.g., downtown vs. a suburb)\n2. Budget (e.g., under $2,500 vs. $2,800+)",
      },
      { role: "user", content: "One job downtown, budget is flexible but under $2,800." },
      {
        role: "assistant",
        content:
          "That's enough to talk trade-offs. With one downtown commute and a family, the dimensions that usually move the decision are commute time, bedroom count for the price, and school catchment.\n\nLast question so I can be concrete: how long a one-way commute is acceptable on a normal weekday?",
      },
    ],
  },
  {
    id: "temporary-first",
    label: "Temporary first, then permanent",
    blurb: "Advisor already knows enough — no extra questions",
    stillMissing: [],
    turns: [
      {
        role: "user",
        content:
          "I land in three weeks, no Canadian credit history, work is near Union Station, budget about $1,800, and I want something temporary for the first two months.",
      },
      {
        role: "assistant",
        content:
          "You've given me enough — no more questions needed.\n\nFor a short first stay, landlords in the temporary market usually care about proof of funds and a clear end date rather than credit. Prepare a proof-of-funds statement, your employment letter, and photo ID as one PDF.\n\nWhen you switch to a full lease, note that in Ontario the legal maximum deposit is first and last month's rent — a damage deposit is not allowed. If anyone asks for money before a live viewing, treat that as a scam signal.",
      },
    ],
  },
];
