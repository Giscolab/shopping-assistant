import { z } from "zod";
import { garmentCategories, recommendationDimensions, stretchLevels } from "@/domain/shared/enums";

export const ontologyFamilyIdSchema = z.enum([
  "tops",
  "bottoms",
  "outerwear",
  "underwear",
  "sportswear",
  "nightwear",
  "accessories_ported",
  "footwear"
]);

export const guideOnlyDimensionSchema = z.enum(["shoulderCm", "neckCm", "sleeveLengthCm", "inseamCm", "backLengthCm"]);
export const ontologyDimensionSchema = z.union([z.enum(recommendationDimensions), guideOnlyDimensionSchema]);

export const ontologyPriorityDimensionSchema = z.object({
  dimension: z.enum(recommendationDimensions),
  weight: z.number().positive()
});

export const ontologyGarmentCategorySchema = z.object({
  id: z.enum(garmentCategories),
  canonicalCategory: z.enum(garmentCategories),
  legacyCategory: z.enum(garmentCategories).optional(),
  family: ontologyFamilyIdSchema,
  label: z.string().min(1),
  subcategories: z.array(z.string().min(1)),
  requiredBodyMeasurements: z.array(ontologyDimensionSchema),
  requiredGuideMeasurements: z.array(ontologyDimensionSchema),
  priorityDimensions: z.array(ontologyPriorityDimensionSchema).min(1),
  easeProfile: z.string().min(1),
  defaultCut: z.string().min(1),
  defaultMaterialProfile: z.string().min(1),
  usageConstraints: z.array(z.string().min(1)),
  expectedEngineOutput: z.array(z.string().min(1))
});

export const garmentOntologyDocumentSchema = z.object({
  version: z.string().min(1),
  scope: z.literal("menswear"),
  provenance: z.object({
    type: z.enum(["internal_model", "imported"]),
    truthfulness: z.string().min(1),
    createdFor: z.string().optional()
  }),
  families: z.array(z.object({ id: ontologyFamilyIdSchema, label: z.string(), description: z.string() })),
  categories: z.array(ontologyGarmentCategorySchema).min(1),
  garmentMeasurementsCatalog: z.array(
    z.object({
      category_id: z.enum(garmentCategories),
      measurement_id: z.string().min(1),
      label_fr: z.string().min(1),
      unit: z.literal("cm"),
      axis: z.enum(["circumference", "length", "width"]),
      measurement_method: z.string().min(1),
      flat_or_circumference: z.enum(["flat", "circumference"]),
      critical_for_fit: z.boolean(),
      linked_body_measurements: z.array(ontologyDimensionSchema),
      affected_by_cut_modifiers: z.boolean(),
      affected_by_material_modifiers: z.boolean(),
      affected_by_layering: z.boolean()
    })
  ),
  categoryMeasurementPriorityDetails: z.array(
    z.object({
      category_id: z.enum(garmentCategories),
      primary_measurements: z.array(z.string().min(1)),
      secondary_measurements: z.array(z.string().min(1)),
      tie_breaker_measurements: z.array(z.string().min(1)),
      fit_critical_measurements: z.array(z.string().min(1)),
      confidence_penalty_if_missing: z.object({
        primary: z.number().min(0),
        secondary: z.number().min(0),
        tie_breaker: z.number().min(0)
      })
    })
  ),
  transformationRules: z.array(
    z.object({
      category_id: z.enum(garmentCategories),
      garment_measurement_id: z.string().min(1),
      formula: z.string().min(1),
      depends_on: z.array(z.string().min(1)),
      assumptions: z.string().min(1),
      notes: z.string().min(1)
    })
  ),
  layeringRules: z.array(
    z.object({
      id: z.string().min(1),
      base_category: z.enum(garmentCategories),
      outer_category: z.enum(garmentCategories),
      extra_ease_by_measurement_id: z.record(z.string(), z.number()),
      notes: z.string().min(1)
    })
  ),
  stylePreferenceModifiers: z.array(
    z.object({
      id: z.string().min(1),
      label_fr: z.string().min(1),
      impact_on_measurements: z.record(z.string(), z.number()),
      notes: z.string().min(1)
    })
  )
});

export const cutOntologyDocumentSchema = z.object({
  version: z.string().min(1),
  cuts: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      description: z.string().min(1),
      dimensionDeltasCm: z.partialRecord(ontologyDimensionSchema, z.number()).default({})
    })
  ),
  cutModifiers: z.array(
    z.object({
      id: z.string().min(1),
      label_fr: z.string().min(1),
      description: z.string().min(1),
      impact_on_measurements: z.partialRecord(ontologyDimensionSchema, z.number()).default({}),
      silhouette_intent: z.string().min(1),
      category_restrictions: z.array(z.enum(garmentCategories))
    })
  )
});

export const easeOntologyDocumentSchema = z.object({
  version: z.string().min(1),
  profiles: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      defaultEaseCm: z.partialRecord(ontologyDimensionSchema, z.number()).default({}),
      notes: z.string().default("")
    })
  ),
  cutSpecificEaseRules: z.array(
    z.object({
      category_id: z.enum(garmentCategories),
      cut_id: z.string().min(1),
      measurement_id: ontologyDimensionSchema,
      ease_value: z.number(),
      unit: z.literal("cm"),
      applies_to: z.string().min(1),
      notes: z.string().min(1)
    })
  )
});

export const materialsOntologyDocumentSchema = z.object({
  version: z.string().min(1),
  profiles: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      stretch: z.enum(stretchLevels),
      stretchRelaxationCm: z.number().min(0),
      shrinkageRisk: z.number().min(0).max(1),
      uncertaintyPenalty: z.number().min(0).max(100)
    })
  ),
  materialModifiers: z.array(
    z.object({
      id: z.string().min(1),
      label_fr: z.string().min(1),
      stretch_horizontal: z.enum(stretchLevels),
      stretch_vertical: z.enum(stretchLevels),
      recovery: z.enum(["low", "medium", "high"]),
      growth_over_time: z.enum(["none", "low", "medium", "high"]),
      thickness: z.enum(["light", "medium", "thick"]),
      drape: z.enum(["fluid", "semi_structured", "structured", "heavy", "body_following"]),
      compression_effect: z.enum(["none", "low", "medium", "high"]),
      shrinkage_risk: z.enum(["low", "medium", "high"]),
      impact_on_measurements: z.record(z.string(), z.number()),
      recommended_ease_adjustments: z.record(z.string(), z.number())
    })
  )
});

export const measurementMappingDocumentSchema = z.object({
  version: z.string().min(1),
  canonicalDimensions: z.array(
    z.object({
      id: ontologyDimensionSchema,
      labelFr: z.string().min(1),
      bodyKeys: z.array(z.string()),
      guideAliases: z.array(z.string()),
      requiresGuideOnly: z.boolean().optional()
    })
  ),
  bodyMeasurementsCatalog: z.array(
    z.object({
      id: ontologyDimensionSchema,
      label_fr: z.string().min(1),
      unit: z.enum(["cm", "mm"]),
      body_zone: z.string().min(1),
      description: z.string().min(1),
      measurement_method: z.string().min(1),
      measurement_orientation: z.string().min(1),
      is_circumference: z.boolean(),
      is_length: z.boolean(),
      required_for_categories: z.array(z.enum(garmentCategories)),
      optional_for_categories: z.array(z.enum(garmentCategories)),
      capture_priority: z.enum(["high", "medium", "low"])
    })
  ),
  leftRightMeasurementResolutionPolicy: z.array(
    z.object({
      canonical_dimension_id: z.enum(["bicepsCm", "forearmCm", "thighCm", "calfCm"]),
      source_keys: z.array(z.string().min(1)).min(2),
      resolution_strategy: z.enum(["average", "max", "dominant_side_if_known"]),
      reason: z.string().min(1),
      confidence_impact_if_asymmetry_high: z.number()
    })
  )
});

export const ontologyBundleSchema = z.object({
  garments: garmentOntologyDocumentSchema,
  cuts: cutOntologyDocumentSchema,
  ease: easeOntologyDocumentSchema,
  materials: materialsOntologyDocumentSchema,
  measurementMapping: measurementMappingDocumentSchema
});

export type OntologyBundleFromSchema = z.infer<typeof ontologyBundleSchema>;
