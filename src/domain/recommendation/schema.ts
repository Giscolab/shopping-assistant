import { z } from "zod";
import {
  easePreferences,
  fitPreferences,
  garmentCategories,
  layeringIntents,
  recommendationDimensions
} from "@/domain/shared/enums";

export const recommendationInputSchema = z.object({
  profileId: z.string().min(1),
  guideId: z.string().min(1),
  garmentCategory: z.enum(garmentCategories),
  fitPreference: z.enum(fitPreferences),
  easePreference: z.enum(easePreferences),
  layeringIntent: z.enum(layeringIntents),
  shrinkageRisk: z.number().min(0).max(1).default(0),
  notes: z.string().default("")
});

export const dimensionBreakdownSchema = z.object({
  dimension: z.enum(recommendationDimensions),
  label: z.string(),
  bodyValue: z.number().nullable(),
  targetValue: z.number().nullable(),
  unit: z.enum(["cm", "mm"]),
  weight: z.number(),
  rowRange: z
    .object({
      min: z.number().nullable(),
      max: z.number().nullable(),
      target: z.number().nullable()
    })
    .nullable(),
  delta: z.number().nullable(),
  score: z.number().min(0).max(100),
  explanation: z.string()
});

export const candidateRecommendationSchema = z.object({
  sizeLabel: z.string(),
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  dimensionBreakdown: z.array(dimensionBreakdownSchema),
  why: z.array(z.string()),
  tradeoffs: z.array(z.string())
});

export const recommendationResultSchema = z.object({
  recommendedSize: z.string(),
  alternativeSizes: z.array(z.string()),
  confidenceScore: z.number().min(0).max(100),
  fitSummary: z.string(),
  dimensionBreakdown: z.array(dimensionBreakdownSchema),
  warnings: z.array(z.string()),
  assumptions: z.array(z.string()),
  whyThisSize: z.array(z.string()),
  whyNotOtherSizes: z.array(z.string()),
  rankedCandidates: z.array(candidateRecommendationSchema)
});

export const recommendationRunSchema = z.object({
  id: z.string().min(1),
  input: recommendationInputSchema,
  result: recommendationResultSchema,
  createdAt: z.string().datetime(),
  saved: z.boolean().default(false)
});

export type RecommendationInput = z.infer<typeof recommendationInputSchema>;
export type RecommendationResult = z.infer<typeof recommendationResultSchema>;
export type CandidateRecommendation = z.infer<typeof candidateRecommendationSchema>;
export type DimensionBreakdown = z.infer<typeof dimensionBreakdownSchema>;
export type RecommendationRun = z.infer<typeof recommendationRunSchema>;
