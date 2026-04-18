import { z } from "zod";
import { recommendationDimensions, fitPreferences } from "@/domain/shared/enums";
import { measurementRangeSchema } from "@/domain/sizing/schema";

export const targetComputationSchema = z.object({
  bodyValue: z.number().nullable(),
  dimension: z.enum(recommendationDimensions),
  baseEaseCm: z.number(),
  fitDeltaCm: z.number(),
  easeDeltaCm: z.number(),
  layeringDeltaCm: z.number(),
  stretchRelaxationCm: z.number(),
  shrinkageBiasCm: z.number()
});

export const rangeScoreSchema = z.object({
  score: z.number().min(0).max(100),
  delta: z.number().nullable(),
  explanation: z.string().min(1)
});

export const ruleExplorerRowSchema = z.object({
  dimension: z.enum(recommendationDimensions),
  fit: z.enum(fitPreferences),
  bodyExample: z.number().nullable(),
  range: measurementRangeSchema.optional(),
  target: z.number().nullable(),
  score: z.number().min(0).max(100),
  explanation: z.string()
});
