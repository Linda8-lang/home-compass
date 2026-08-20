import { z } from "zod";

const neighbourhoodRent = z.object({
  area_name: z.string().min(1),
  hood_id: z.number().int().nullable(),
  median_renter_shelter_cost: z.number().nonnegative().nullable(),
  median_owner_shelter_cost: z.number().nonnegative().nullable(),
});

export const rentBenchmarksSchema = z.object({
  data_status: z.enum(["ok", "stale", "fallback_city_level"]),
  data_level: z.enum(["neighbourhood", "city"]),
  last_updated: z.string().datetime(),
  source: z.object({
    name: z.string().min(1),
    endpoint: z.string().url(),
    disclaimer: z.string().min(1),
  }),
  neighbourhoods: z.array(neighbourhoodRent).min(1),
});

export type RentBenchmarks = z.infer<typeof rentBenchmarksSchema>;
