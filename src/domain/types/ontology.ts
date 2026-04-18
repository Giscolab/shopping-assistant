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
  garmentMeasurementsCatalog: Array<{
    category_id: string;
    measurement_id: string;
    label_fr: string;
    unit: "cm";
    axis: "circumference" | "length" | "width";
    measurement_method: string;
    flat_or_circumference: "flat" | "circumference";
    critical_for_fit: boolean;
    linked_body_measurements: OntologyDimension[];
    affected_by_cut_modifiers: boolean;
    affected_by_material_modifiers: boolean;
    affected_by_layering: boolean;
  }>;
  categoryMeasurementPriorityDetails: Array<{
    category_id: string;
    primary_measurements: string[];
    secondary_measurements: string[];
    tie_breaker_measurements: string[];
    fit_critical_measurements: string[];
    confidence_penalty_if_missing: {
      primary: number;
      secondary: number;
      tie_breaker: number;
    };
  }>;
  transformationRules: Array<{
    category_id: string;
    garment_measurement_id: string;
    formula: string;
    depends_on: string[];
    assumptions: string;
    notes: string;
  }>;
  layeringRules: Array<{
    id: string;
    base_category: string;
    outer_category: string;
    extra_ease_by_measurement_id: Record<string, number>;
    notes: string;
  }>;
  stylePreferenceModifiers: Array<{
    id: string;
    label_fr: string;
    impact_on_measurements: Record<string, number>;
    notes: string;
  }>;
}

export interface CutOntologyDocument {
  version: string;
  cuts: Array<{
    id: string;
    label: string;
    description: string;
    dimensionDeltasCm: Partial<Record<OntologyDimension, number>>;
  }>;
  cutModifiers: Array<{
    id: string;
    label_fr: string;
    description: string;
    impact_on_measurements: Partial<Record<OntologyDimension, number>>;
    silhouette_intent: string;
    category_restrictions: string[];
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
  cutSpecificEaseRules: Array<{
    category_id: string;
    cut_id: string;
    measurement_id: OntologyDimension;
    ease_value: number;
    unit: "cm";
    applies_to: string;
    notes: string;
  }>;
}

export interface MaterialsOntologyDocument {
  version: string;
  profiles: MaterialProfileRule[];
  materialModifiers: Array<{
    id: string;
    label_fr: string;
    stretch_horizontal: string;
    stretch_vertical: string;
    recovery: string;
    growth_over_time: string;
    thickness: string;
    drape: string;
    compression_effect: string;
    shrinkage_risk: string;
    impact_on_measurements: Record<string, number>;
    recommended_ease_adjustments: Record<string, number>;
  }>;
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
  bodyMeasurementsCatalog: Array<{
    id: OntologyDimension;
    label_fr: string;
    unit: "cm" | "mm";
    body_zone: string;
    description: string;
    measurement_method: string;
    measurement_orientation: string;
    is_circumference: boolean;
    is_length: boolean;
    required_for_categories: string[];
    optional_for_categories: string[];
    capture_priority: "high" | "medium" | "low";
  }>;
  leftRightMeasurementResolutionPolicy: Array<{
    canonical_dimension_id: "bicepsCm" | "forearmCm" | "thighCm" | "calfCm";
    source_keys: string[];
    resolution_strategy: "average" | "max" | "dominant_side_if_known";
    reason: string;
    confidence_impact_if_asymmetry_high: number;
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
