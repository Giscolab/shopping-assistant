import { averageOptional, roundMeasurement } from "@/domain/units/measurements";
import type { BodyProfile } from "@/domain/body-profile/schema";
import { fitDelta, easeDelta, garmentTaxonomy, layeringDelta, stretchRelaxation } from "@/domain/garments/taxonomy";
import type { DimensionRule } from "@/domain/garments/taxonomy";
import { ontologyBundle } from "@/domain/ontology";
import type { RecommendationDimension } from "@/domain/shared/enums";
import type { BrandSizeGuide, SizeGuideRow } from "@/domain/sizing/schema";
import { computeCandidateConfidence, computeCandidateScore, closeAlternativeThreshold } from "@/domain/sizing/confidence";
import { computeTargetDimension, describeDimensionUnit, shrinkageBiasCm } from "@/domain/sizing/ease";
import { dimensionLabels, scoreAgainstMeasurementRange } from "@/domain/sizing/rules";
import {
  countMissingBodyDimensions,
  countMissingGuideDimensions,
  getDominantDimensions,
  weightedDimensionScore
} from "@/domain/sizing/weights";
import type {
  CandidateRecommendation,
  DimensionBreakdown,
  RecommendationInput,
  RecommendationResult
} from "@/domain/recommendation/schema";

export function getBodyDimension(profile: BodyProfile, dimension: RecommendationDimension): number | null {
  const policy = ontologyBundle.measurementMapping.leftRightMeasurementResolutionPolicy.find(
    (entry) => entry.canonical_dimension_id === dimension
  );
  const resolveBilateral = (left: number | null, right: number | null) => {
    if (!policy || policy.resolution_strategy === "average") return averageOptional([left, right]);
    if (policy.resolution_strategy === "max") {
      if (left === null) return right;
      if (right === null) return left;
      return Math.max(left, right);
    }
    return averageOptional([left, right]);
  };

  switch (dimension) {
    case "bicepsCm":
      return resolveBilateral(profile.leftBicepsCm, profile.rightBicepsCm);
    case "forearmCm":
      return resolveBilateral(profile.leftForearmCm, profile.rightForearmCm);
    case "thighCm":
      return resolveBilateral(profile.leftThighCm, profile.rightThighCm);
    case "calfCm":
      return resolveBilateral(profile.leftCalfCm, profile.rightCalfCm);
    case "footLengthMm":
      return profile.footLengthMm;
    default:
      return profile[dimension];
  }
}

function computeTarget(
  profile: BodyProfile,
  dimension: RecommendationDimension,
  rule: DimensionRule,
  input: RecommendationInput,
  guide: BrandSizeGuide
) {
  const bodyValue = getBodyDimension(profile, dimension);
  if (bodyValue === null) return null;

  const taxonomy = garmentTaxonomy[input.garmentCategory];
  return computeTargetDimension({
    bodyValue,
    dimension,
    baseEaseCm: rule.baseEaseCm,
    fitDeltaCm: fitDelta(rule, input.fitPreference),
    easeDeltaCm: easeDelta(input.easePreference),
    layeringDeltaCm: layeringDelta(input.layeringIntent, taxonomy.family),
    stretchRelaxationCm: stretchRelaxation(guide.fabricStretch, dimension),
    shrinkageBiasCm: shrinkageBiasCm(input.shrinkageRisk)
  }).targetValue;
}

function candidateForRow(
  profile: BodyProfile,
  guide: BrandSizeGuide,
  input: RecommendationInput,
  row: SizeGuideRow
): CandidateRecommendation {
  const taxonomy = garmentTaxonomy[input.garmentCategory];
  const breakdown: DimensionBreakdown[] = taxonomy.dimensionRules.map((rule) => {
    const targetValue = computeTarget(profile, rule.dimension, rule, input, guide);
    const bodyValue = getBodyDimension(profile, rule.dimension);
    const range = row.dimensions[rule.dimension];
    const rangeScore = scoreAgainstMeasurementRange(targetValue, range);
    return {
      dimension: rule.dimension,
      label: dimensionLabels[rule.dimension],
      bodyValue,
      targetValue,
      unit: describeDimensionUnit(rule.dimension),
      weight: rule.weight,
      rowRange: range ? { min: range.min, max: range.max, target: range.target } : null,
      delta: rangeScore.delta,
      score: roundMeasurement(rangeScore.score, 0),
      explanation: rangeScore.explanation
    };
  });

  const weightedScore = weightedDimensionScore(breakdown);
  const confidenceInput = {
    weightedScore,
    guideUncertainty: guide.uncertainty,
    guideIsSample: guide.isSample,
    guideIsComplete: guide.isComplete,
    missingGuideDimensions: countMissingGuideDimensions(breakdown),
    missingBodyDimensions: countMissingBodyDimensions(breakdown)
  };
  const score = computeCandidateScore(confidenceInput);
  const confidence = computeCandidateConfidence(confidenceInput);

  const dominant = getDominantDimensions(breakdown, 2);
  const tradeoffs = breakdown
    .filter((item) => item.score < 72)
    .map((item) => `${item.label}: ${item.explanation}`);

  return {
    sizeLabel: row.label,
    score: roundMeasurement(score, 0),
    confidence: roundMeasurement(confidence, 0),
    dimensionBreakdown: breakdown,
    why: dominant.map((item) => `${item.label}: cible ${item.targetValue ?? "?"} ${item.unit}, score ${item.score}/100.`),
    tradeoffs
  };
}

export function recommendSize(profile: BodyProfile, guide: BrandSizeGuide, input: RecommendationInput): RecommendationResult {
  const parsedRows = [...guide.rows].sort((a, b) => a.sortOrder - b.sortOrder);
  if (parsedRows.length === 0) {
    return {
      recommendedSize: "Indéterminé",
      alternativeSizes: [],
      confidenceScore: 0,
      fitSummary: "Aucun rang de taille exploitable dans ce guide.",
      dimensionBreakdown: [],
      warnings: ["Le guide sélectionné ne contient aucune ligne de taille."],
      assumptions: ["Aucune recommandation calculée sans données de guide."],
      whyThisSize: [],
      whyNotOtherSizes: [],
      rankedCandidates: []
    };
  }

  const rankedCandidates = parsedRows
    .map((row) => candidateForRow(profile, guide, input, row))
    .sort((a, b) => b.score - a.score);

  const best = rankedCandidates[0];
  const alternativeThreshold = closeAlternativeThreshold(best.confidence);
  const alternatives = rankedCandidates
    .slice(1)
    .filter((candidate) => best.score - candidate.score <= alternativeThreshold)
    .map((candidate) => candidate.sizeLabel);

  const warnings: string[] = [];
  if (guide.isSample) {
    warnings.push("Guide illustratif: ne pas interpréter comme standard officiel ou donnée de marque réelle.");
  }
  if (!guide.isComplete) {
    warnings.push("Guide incomplet: certaines dimensions attendues sont absentes.");
  }
  if (input.shrinkageRisk > 0.35) {
    warnings.push("Risque de rétrécissement pris en compte; vérifier la matière et les consignes de lavage.");
  }
  if (best.dimensionBreakdown.some((item) => item.bodyValue === null)) {
    warnings.push("Profil incomplet: une ou plusieurs mesures corporelles utiles manquent.");
  }

  const whyNotOtherSizes = rankedCandidates.slice(1, 4).map((candidate) => {
    const gap = roundMeasurement(best.score - candidate.score, 0);
    const tradeoff = candidate.tradeoffs[0] ? ` (${candidate.tradeoffs[0]})` : "";
    return `${candidate.sizeLabel}: score inférieur de ${gap} points${tradeoff}.`;
  });

  return {
    recommendedSize: best.sizeLabel,
    alternativeSizes: alternatives,
    confidenceScore: best.confidence,
    fitSummary: `${guide.name}: taille ${best.sizeLabel} recommandée avec une confiance ${best.confidence}/100.`,
    dimensionBreakdown: best.dimensionBreakdown,
    warnings,
    assumptions: [
      "Les mesures internes sont en unités métriques canoniques.",
      "Les plages du guide sont traitées comme des mesures compatibles vêtement/corps selon la source.",
      "Les conversions génériques ne sont pas utilisées comme vérité officielle."
    ],
    whyThisSize: best.why,
    whyNotOtherSizes,
    rankedCandidates
  };
}
