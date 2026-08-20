import { z } from "zod";

export const OFFENCE_TYPES = [
  "assault",
  "auto_theft",
  "bike_theft",
  "break_enter",
  "homicide",
  "robbery",
  "shooting",
  "theft_over",
  "theft_from_motor_vehicle",
] as const;

const offenceStat = z.object({
  count: z.number().int().nonnegative().nullable(),
  rate_per_100k: z.number().nonnegative().nullable(),
});

const neighbourhoodSafety = z.object({
  area_name: z.string().min(1),
  hood_id: z.number().int(),
  population: z.number().int().nonnegative().nullable(),
  offences: z.record(z.enum(OFFENCE_TYPES), offenceStat),
});

export const safetyIndicesSchema = z.object({
  data_status: z.enum(["ok", "stale", "fallback_city_level"]),
  data_level: z.enum(["neighbourhood", "city"]),
  last_updated: z.string().datetime(),
  source: z.object({
    name: z.string().min(1),
    endpoint: z.string().url(),
    disclaimer: z.string().min(1),
  }),
  neighbourhoods: z.array(neighbourhoodSafety).min(1),
});

export type SafetyIndices = z.infer<typeof safetyIndicesSchema>;
