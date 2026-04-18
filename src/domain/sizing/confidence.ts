import type { CandidateConfidenceInput } from "@/domain/types/sizing";

export function computeCandidateScore(input: CandidateConfidenceInput) {
  const missingGuidePenalty = input.missingGuideDimensions * 7;
  const missingBodyPenalty = input.missingBodyDimensions * 10;
  const uncertaintyPenalty = input.guideUncertainty * 18;
  const materialPenalty = input.materialUncertaintyPenalty ?? 0;
  return Math.max(0, Math.min(100, input.weightedScore - missingGuidePenalty - missingBodyPenalty - uncertaintyPenalty - materialPenalty));
}

export function computeCandidateConfidence(input: CandidateConfidenceInput) {
  const score = computeCandidateScore(input);
  return Math.max(0, Math.min(100, score - (input.guideIsSample ? 10 : 0) - (input.guideIsComplete ? 0 : 8)));
}

export function closeAlternativeThreshold(confidence: number) {
  if (confidence < 50) return 12;
  if (confidence < 70) return 10;
  return 8;
}
