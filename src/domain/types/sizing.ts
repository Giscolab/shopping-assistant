import type { FitPreference, RecommendationDimension } from "@/domain/shared/enums";
import type { MeasurementRange } from "@/domain/sizing/schema";

export interface TargetComputationInput {
  bodyValue: number | null;
  dimension: RecommendationDimension;
  baseEaseCm: number;
  fitDeltaCm: number;
  easeDeltaCm: number;
  layeringDeltaCm: number;
  stretchRelaxationCm: number;
  shrinkageBiasCm: number;
}

export interface TargetComputationResult {
  targetValue: number | null;
  formula: string;
}

export interface RangeScoreResult {
  score: number;
  delta: number | null;
  explanation: string;
}

export interface CandidateConfidenceInput {
  weightedScore: number;
  guideUncertainty: number;
  guideIsSample: boolean;
  guideIsComplete: boolean;
  missingGuideDimensions: number;
  missingBodyDimensions: number;
  materialUncertaintyPenalty?: number;
}

export interface RuleExplorerRow {
  dimension: RecommendationDimension;
  fit: FitPreference;
  bodyExample: number | null;
  range?: MeasurementRange;
  target: number | null;
  score: number;
  explanation: string;
}
