import { roundMeasurement } from "@/domain/units/measurements";
import type { RecommendationDimension } from "@/domain/shared/enums";
import type { TargetComputationInput, TargetComputationResult } from "@/domain/types/sizing";

export function shrinkageBiasCm(shrinkageRisk: number) {
  return shrinkageRisk > 0.35 ? shrinkageRisk * 1.8 : 0;
}

export function computeTargetDimension(input: TargetComputationInput): TargetComputationResult {
  if (input.bodyValue === null) {
    return {
      targetValue: null,
      formula: "body=null => cible indisponible"
    };
  }
  if (input.dimension === "heightCm" || input.dimension === "footLengthMm") {
    return {
      targetValue: roundMeasurement(input.bodyValue, input.dimension === "footLengthMm" ? 0 : 1),
      formula: "dimension de longueur directe, sans aisance ajoutée"
    };
  }

  const target =
    input.bodyValue +
    input.baseEaseCm +
    input.fitDeltaCm +
    input.easeDeltaCm +
    input.layeringDeltaCm -
    input.stretchRelaxationCm +
    input.shrinkageBiasCm;

  return {
    targetValue: roundMeasurement(Math.max(target, input.bodyValue - 2), 1),
    formula: [
      `corps ${input.bodyValue}`,
      `aisance ${input.baseEaseCm}`,
      `coupe ${input.fitDeltaCm}`,
      `préférence ${input.easeDeltaCm}`,
      `layering ${input.layeringDeltaCm}`,
      `stretch -${input.stretchRelaxationCm}`,
      `rétrécissement ${roundMeasurement(input.shrinkageBiasCm, 1)}`
    ].join(" + ")
  };
}

export function describeDimensionUnit(dimension: RecommendationDimension): "cm" | "mm" {
  return dimension === "footLengthMm" ? "mm" : "cm";
}
