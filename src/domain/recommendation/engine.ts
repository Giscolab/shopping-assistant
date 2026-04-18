import { averageOptional, roundMeasurement } from "@/domain/units/measurements";
import type { BodyProfile } from "@/domain/body-profile/schema";
import { fitDelta, easeDelta, garmentTaxonomy, layeringDelta, stretchRelaxation } from "@/domain/garments/taxonomy";
import type { DimensionRule } from "@/domain/garments/taxonomy";
import type { RecommendationDimension } from "@/domain/shared/enums";
import type { BrandSizeGuide, MeasurementRange, SizeGuideRow } from "@/domain/sizing/schema";
import type {
  CandidateRecommendation,
  DimensionBreakdown,
  RecommendationInput,
  RecommendationResult
} from "@/domain/recommendation/schema";

const dimensionLabels: Record<RecommendationDimension, string> = {
  chestCm: "Poitrine",
  waistCm: "Taille",
  stomachCm: "Ventre",
  seatHipsCm: "Bassin / fessiers",
  bicepsCm: "Biceps",
  forearmCm: "Avant-bras",
  thighCm: "Cuisse",
  calfCm: "Mollet",
  footLengthMm: "Longueur de pied",
  heightCm: "Taille corporelle"
};

export function getBodyDimension(profile: BodyProfile, dimension: RecommendationDimension): number | null {
  switch (dimension) {
    case "bicepsCm":
      return averageOptional([profile.leftBicepsCm, profile.rightBicepsCm]);
    case "forearmCm":
      return averageOptional([profile.leftForearmCm, profile.rightForearmCm]);
    case "thighCm":
      return averageOptional([profile.leftThighCm, profile.rightThighCm]);
    case "calfCm":
      return averageOptional([profile.leftCalfCm, profile.rightCalfCm]);
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
  if (dimension === "heightCm" || dimension === "footLengthMm") return roundMeasurement(bodyValue, 0);

  const taxonomy = garmentTaxonomy[input.garmentCategory];
  const shrinkageBias = input.shrinkageRisk > 0.35 ? input.shrinkageRisk * 1.8 : 0;
  const target =
    bodyValue +
    rule.baseEaseCm +
    fitDelta(rule, input.fitPreference) +
    easeDelta(input.easePreference) +
    layeringDelta(input.layeringIntent, taxonomy.family) -
    stretchRelaxation(guide.fabricStretch, dimension) +
    shrinkageBias;

  return roundMeasurement(Math.max(target, bodyValue - 2), 1);
}

function scoreAgainstRange(target: number | null, range: MeasurementRange | undefined) {
  if (target === null) {
    return { score: 42, delta: null, explanation: "Mesure corporelle manquante; signal ignoré avec pénalité." };
  }
  if (!range) {
    return { score: 54, delta: null, explanation: "Mesure absente du guide; confiance diminuée." };
  }

  if (range.target !== null) {
    const delta = roundMeasurement(target - range.target, range.unit === "mm" ? 0 : 1);
    const score = Math.max(0, 100 - Math.abs(delta) * (range.unit === "mm" ? 1.2 : 7));
    return {
      score,
      delta,
      explanation:
        Math.abs(delta) <= (range.unit === "mm" ? 8 : 1.5)
          ? "Cible proche de la mesure centrale du guide."
          : delta > 0
            ? "La cible dépasse la mesure centrale du guide."
            : "La cible est inférieure à la mesure centrale du guide."
    };
  }

  const min = range.min ?? Number.NEGATIVE_INFINITY;
  const max = range.max ?? Number.POSITIVE_INFINITY;
  if (target >= min && target <= max) {
    const center = Number.isFinite(min) && Number.isFinite(max) ? (min + max) / 2 : target;
    const width = Number.isFinite(min) && Number.isFinite(max) ? Math.max(1, max - min) : 1;
    const centrality = Math.max(0, 1 - Math.abs(target - center) / width);
    return {
      score: 86 + centrality * 14,
      delta: 0,
      explanation: "La cible tombe dans la plage publiée du guide."
    };
  }

  const distance = target < min ? min - target : target - max;
  const multiplier = range.unit === "mm" ? 1.4 : 9;
  const score = Math.max(0, 76 - distance * multiplier);
  return {
    score,
    delta: roundMeasurement(target < min ? -distance : distance, range.unit === "mm" ? 0 : 1),
    explanation:
      target < min
        ? "La cible est sous la plage du guide; risque de volume excédentaire."
        : "La cible dépasse la plage du guide; risque de vêtement trop serré."
  };
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
    const rangeScore = scoreAgainstRange(targetValue, range);
    return {
      dimension: rule.dimension,
      label: dimensionLabels[rule.dimension],
      bodyValue,
      targetValue,
      unit: rule.dimension === "footLengthMm" ? "mm" : "cm",
      weight: rule.weight,
      rowRange: range ? { min: range.min, max: range.max, target: range.target } : null,
      delta: rangeScore.delta,
      score: roundMeasurement(rangeScore.score, 0),
      explanation: rangeScore.explanation
    };
  });

  const weightedScore = breakdown.reduce((sum, item) => sum + item.score * item.weight, 0);
  const missingGuidePenalty = breakdown.filter((item) => item.rowRange === null).length * 7;
  const missingBodyPenalty = breakdown.filter((item) => item.bodyValue === null).length * 10;
  const uncertaintyPenalty = guide.uncertainty * 18;
  const score = Math.max(0, Math.min(100, weightedScore - missingGuidePenalty - missingBodyPenalty - uncertaintyPenalty));
  const confidence = Math.max(0, Math.min(100, score - (guide.isSample ? 10 : 0) - (guide.isComplete ? 0 : 8)));

  const dominant = [...breakdown].sort((a, b) => b.weight - a.weight).slice(0, 2);
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
  const alternatives = rankedCandidates
    .slice(1)
    .filter((candidate) => best.score - candidate.score <= 8)
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
