import type { BodyProfile } from "@/domain/body-profile/schema";
import type { RecommendationRun } from "@/domain/recommendation/schema";

export function exportBodyProfileJson(profile: BodyProfile) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      format: "size-intelligence-studio.body-profile.v1",
      profile
    },
    null,
    2
  );
}

export function exportRecommendationRunJson(run: RecommendationRun) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      format: "size-intelligence-studio.recommendation-run.v1",
      run
    },
    null,
    2
  );
}

export function exportRecommendationRunsCsv(runs: RecommendationRun[]) {
  const headers = [
    "created_at",
    "profile_id",
    "guide_id",
    "garment_category",
    "recommended_size",
    "confidence_score",
    "alternatives",
    "warnings"
  ];
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  const lines = runs.map((run) =>
    [
      run.createdAt,
      run.input.profileId,
      run.input.guideId,
      run.input.garmentCategory,
      run.result.recommendedSize,
      run.result.confidenceScore,
      run.result.alternativeSizes.join("|"),
      run.result.warnings.join("|")
    ]
      .map(escape)
      .join(",")
  );
  return [headers.join(","), ...lines].join("\n");
}
