import { roundMeasurement } from "@/domain/units/measurements";
import type { RecommendationDimension } from "@/domain/shared/enums";
import type { MeasurementRange } from "@/domain/sizing/schema";
import type { RangeScoreResult } from "@/domain/types/sizing";

export const dimensionLabels: Record<RecommendationDimension, string> = {
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

export function scoreAgainstMeasurementRange(target: number | null, range: MeasurementRange | undefined): RangeScoreResult {
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
