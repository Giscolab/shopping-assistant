import type { BodyMeasurementKey, RecommendationDimension } from "@/domain/shared/enums";

export type Unit = "cm" | "mm" | "kg" | "percent";

export function roundMeasurement(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function normalizeLengthToCm(value: number, unit: Unit) {
  if (unit === "cm") return roundMeasurement(value);
  if (unit === "mm") return roundMeasurement(value / 10);
  throw new Error(`Unit ${unit} is not a length unit`);
}

export function normalizeLengthToMm(value: number, unit: Unit) {
  if (unit === "mm") return Math.round(value);
  if (unit === "cm") return Math.round(value * 10);
  throw new Error(`Unit ${unit} is not a length unit`);
}

export function parseLocaleNumber(raw: string) {
  const normalized = raw
    .replace(/\u00a0/g, " ")
    .replace(",", ".")
    .replace(/[^\d.-]/g, "")
    .trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function averageOptional(values: Array<number | null | undefined>) {
  const present = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (present.length === 0) return null;
  return roundMeasurement(present.reduce((sum, value) => sum + value, 0) / present.length);
}

export function bodyKeyForRecommendationDimension(dimension: RecommendationDimension): BodyMeasurementKey | null {
  if (dimension === "bicepsCm" || dimension === "forearmCm" || dimension === "thighCm" || dimension === "calfCm") {
    return null;
  }
  return dimension;
}
