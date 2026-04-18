import { invoke } from "@tauri-apps/api/core";
import { ontologyBundle, validateOntologyIntegration } from "@/domain/ontology";
import type { AppState } from "@/services/persistence/appState";
import type { OntologyDiagnostic } from "@/domain/types/ontology";

export interface GuideCoverageRow {
  categoryId: string;
  label: string;
  guideCount: number;
  completeGuideCount: number;
  hasSampleOnly: boolean;
  missingRequiredGuideDimensions: string[];
}

export interface DatabaseDiagnostics {
  runtime: "tauri" | "browser";
  databasePath: string | null;
  schemaVersion: number;
  tableCounts: Record<string, number>;
}

function isTauriRuntime() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function buildGuideCoverageDiagnostics(state: AppState): GuideCoverageRow[] {
  return ontologyBundle.garments.categories.map((category) => {
    const guides = state.brandSizeGuides.filter(
      (guide) => guide.garmentCategory === category.id || guide.garmentCategory === category.legacyCategory
    );
    const guideDimensions = new Set(guides.flatMap((guide) => guide.rows.flatMap((row) => Object.keys(row.dimensions))));
    const missingRequiredGuideDimensions = category.requiredGuideMeasurements.filter(
      (dimension) => !guideDimensions.has(dimension)
    );
    return {
      categoryId: category.id,
      label: category.label,
      guideCount: guides.length,
      completeGuideCount: guides.filter((guide) => guide.isComplete).length,
      hasSampleOnly: guides.length > 0 && guides.every((guide) => guide.isSample),
      missingRequiredGuideDimensions
    };
  });
}

export function buildDiagnosticEvents(state: AppState): OntologyDiagnostic[] {
  const ontologyDiagnostics = validateOntologyIntegration();
  const guideDiagnostics = buildGuideCoverageDiagnostics(state)
    .filter((row) => row.guideCount === 0 || row.missingRequiredGuideDimensions.length > 0 || row.hasSampleOnly)
    .map<OntologyDiagnostic>((row) => ({
      severity: row.guideCount === 0 ? "error" : "warning",
      code: row.guideCount === 0 ? "missing_guide_for_ontology_category" : "guide_coverage_limited",
      entityId: row.categoryId,
      message:
        row.guideCount === 0
          ? `Aucun guide n'est disponible pour ${row.label}.`
          : `${row.label}: couverture guide limitée (${row.missingRequiredGuideDimensions.join(", ") || "sample only"}).`
    }));
  return [...ontologyDiagnostics, ...guideDiagnostics];
}

export async function loadDatabaseDiagnostics(state: AppState): Promise<DatabaseDiagnostics> {
  if (isTauriRuntime()) {
    return invoke<DatabaseDiagnostics>("get_database_diagnostics");
  }
  return {
    runtime: "browser",
    databasePath: null,
    schemaVersion: state.schemaVersion,
    tableCounts: {
      body_profiles: state.bodyProfiles.length,
      brand_size_guides: state.brandSizeGuides.length,
      recommendation_runs: state.recommendationRuns.length,
      import_jobs: state.importJobs.length,
      ontology_categories: ontologyBundle.garments.categories.length
    }
  };
}

export function exportDiagnosticsJson(state: AppState) {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      format: "size-intelligence-studio.diagnostics.v1",
      ontologyVersion: ontologyBundle.garments.version,
      diagnostics: buildDiagnosticEvents(state),
      guideCoverage: buildGuideCoverageDiagnostics(state)
    },
    null,
    2
  );
}
