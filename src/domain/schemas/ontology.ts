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
  categories: z.array(ontologyGarmentCategorySchema).min(1)
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
