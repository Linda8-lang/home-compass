import { z } from "zod";

const zoneStat = z.object({
  zone_name: z.string().min(1),
  bachelor_avg_rent: z.number().nonnegative().nullable(),
  one_bed_avg_rent: z.number().nonnegative().nullable(),
  two_bed_avg_rent: z.number().nonnegative().nullable(),
  three_bed_plus_avg_rent: z.number().nonnegative().nullable(),
  vacancy_rate_pct: z.number().nonnegative().nullable(),
});

export const cmhcBaselineSchema = z.object({
  data_status: z.enum(["ok", "stale"]),
  data_level: z.literal("city"),
  last_updated: z.string().datetime(),
  cadence: z.string().min(1),
  source: z.object({
    name: z.string().min(1),
    endpoint: z.string().min(1),
    disclaimer: z.string().min(1),
  }),
  zones: z.array(zoneStat).min(1),
});

export type CmhcBaseline = z.infer<typeof cmhcBaselineSchema>;
