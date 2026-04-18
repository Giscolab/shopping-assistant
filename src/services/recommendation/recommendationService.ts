import type { BodyProfile } from "@/domain/body-profile/schema";
import { recommendationInputSchema, type RecommendationInput, type RecommendationRun } from "@/domain/recommendation/schema";
import { recommendSize } from "@/domain/recommendation/engine";
import type { BrandSizeGuide } from "@/domain/sizing/schema";
import { createId, nowIso } from "@/domain/shared/ids";

export function runRecommendation(profile: BodyProfile, guide: BrandSizeGuide, input: RecommendationInput): RecommendationRun {
  const parsedInput = recommendationInputSchema.parse(input);
  const result = recommendSize(profile, guide, parsedInput);
  return {
    id: createId("run"),
    input: parsedInput,
    result,
    createdAt: nowIso(),
    saved: true
  };
}
