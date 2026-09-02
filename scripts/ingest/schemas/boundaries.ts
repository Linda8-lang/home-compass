import { z } from "zod";

const position = z.tuple([z.number(), z.number()]).rest(z.number());

const polygonGeometry = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(position)),
});

const multiPolygonGeometry = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(z.array(position))),
});

const neighbourhoodBoundary = z.object({
  hood_id: z.number().int(),
  area_name: z.string().min(1),
  geometry: z.discriminatedUnion("type", [polygonGeometry, multiPolygonGeometry]),
});

export const neighbourhoodBoundariesSchema = z.object({
  data_status: z.enum(["ok", "stale", "fallback_city_level"]),
  data_level: z.enum(["neighbourhood", "city"]),
  last_updated: z.string().datetime(),
  source: z.object({
    name: z.string().min(1),
    endpoint: z.string().url(),
    disclaimer: z.string().min(1),
  }),
  features: z.array(neighbourhoodBoundary).min(1),
});

export type NeighbourhoodBoundaries = z.infer<typeof neighbourhoodBoundariesSchema>;
