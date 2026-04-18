import type { DimensionBreakdown } from "@/domain/recommendation/schema";

export function weightedDimensionScore(breakdown: DimensionBreakdown[]) {
  return breakdown.reduce((sum, item) => sum + item.score * item.weight, 0);
}

export function getDominantDimensions(breakdown: DimensionBreakdown[], count = 2) {
  return [...breakdown].sort((a, b) => b.weight - a.weight).slice(0, count);
}

export function countMissingGuideDimensions(breakdown: DimensionBreakdown[]) {
  return breakdown.filter((item) => item.rowRange === null).length;
}

export function countMissingBodyDimensions(breakdown: DimensionBreakdown[]) {
  return breakdown.filter((item) => item.bodyValue === null).length;
}
