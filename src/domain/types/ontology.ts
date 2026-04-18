import type { OntologyFamilyId, OntologyGarmentCategory, OntologyDimension, MaterialProfileRule } from "@/domain/types/garment";

export interface OntologyProvenance {
  type: "internal_model" | "imported";
  truthfulness: string;
  createdFor?: string;
}

export interface OntologyFamily {
  id: OntologyFamilyId;
  label: string;
  description: string;
}

export interface GarmentOntologyDocument {
  version: string;
  scope: "menswear";
  provenance: OntologyProvenance;
  families: OntologyFamily[];
  categories: OntologyGarmentCategory[];
}

export interface CutOntologyDocument {
  version: string;
  cuts: Array<{
    id: string;
    label: string;
    description: string;
    dimensionDeltasCm: Partial<Record<OntologyDimension, number>>;
  }>;
}

export interface EaseOntologyDocument {
  version: string;
  profiles: Array<{
    id: string;
    label: string;
    defaultEaseCm: Partial<Record<OntologyDimension, number>>;
    notes: string;
  }>;
}

export interface MaterialsOntologyDocument {
  version: string;
  profiles: MaterialProfileRule[];
}

export interface MeasurementMappingDocument {
  version: string;
  canonicalDimensions: Array<{
    id: OntologyDimension;
    labelFr: string;
    bodyKeys: string[];
    guideAliases: string[];
    requiresGuideOnly?: boolean;
  }>;
}

export interface OntologyBundle {
  garments: GarmentOntologyDocument;
  cuts: CutOntologyDocument;
  ease: EaseOntologyDocument;
  materials: MaterialsOntologyDocument;
  measurementMapping: MeasurementMappingDocument;
}

export interface OntologyDiagnostic {
  severity: "info" | "warning" | "error";
  code: string;
  message: string;
  entityId?: string;
}
