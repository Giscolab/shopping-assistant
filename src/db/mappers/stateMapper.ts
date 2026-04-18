import type { AppState } from "@/services/persistence/appState";

export interface NormalizedPersistenceSummary {
  profiles: number;
  guides: number;
  guideRows: number;
  guideMeasurements: number;
  recommendationRuns: number;
  importJobs: number;
}

export function summarizeNormalizedState(state: AppState): NormalizedPersistenceSummary {
  return {
    profiles: state.bodyProfiles.length,
    guides: state.brandSizeGuides.length,
    guideRows: state.brandSizeGuides.reduce((sum, guide) => sum + guide.rows.length, 0),
    guideMeasurements: state.brandSizeGuides.reduce(
      (sum, guide) => sum + guide.rows.reduce((rowSum, row) => rowSum + Object.keys(row.dimensions).length, 0),
      0
    ),
    recommendationRuns: state.recommendationRuns.length,
    importJobs: state.importJobs.length
  };
}
