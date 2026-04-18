import { z } from "zod";
import { garmentCategories, recommendationDimensions, sizeSystems, stretchLevels } from "@/domain/shared/enums";

export const measurementRangeSchema = z
  .object({
    min: z.number().finite().nullable().default(null),
    max: z.number().finite().nullable().default(null),
    target: z.number().finite().nullable().default(null),
    unit: z.enum(["cm", "mm"]).default("cm"),
    sourceNote: z.string().optional()
  })
  .refine((value) => value.min !== null || value.max !== null || value.target !== null, {
    message: "Une mesure de guide doit contenir au moins min, max ou target."
  });

export const sizeGuideRowSchema = z.object({
  id: z.string().min(1),
  guideId: z.string().min(1),
  label: z.string().min(1),
  sortOrder: z.number().int().nonnegative(),
  dimensions: z.partialRecord(z.enum(recommendationDimensions), measurementRangeSchema).default({}),
  notes: z.string().default("")
});

export const brandSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  country: z.string().nullable().default(null),
  website: z.string().url().nullable().default(null),
  isSample: z.boolean().default(false),
  notes: z.string().default(""),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const brandSizeGuideSchema = z.object({
  id: z.string().min(1),
  brandId: z.string().min(1),
  name: z.string().min(1),
  garmentCategory: z.enum(garmentCategories),
  sizeSystem: z.enum(sizeSystems),
  fabricStretch: z.enum(stretchLevels).default("low"),
  fitNotes: z.string().default(""),
  fabricNotes: z.string().default(""),
  sourceType: z.enum(["manual", "csv_import", "json_import", "seed"]).default("manual"),
  sourceName: z.string().default("Saisie locale"),
  sourceUrl: z.string().url().nullable().default(null),
  isSample: z.boolean().default(false),
  isComplete: z.boolean().default(false),
  uncertainty: z.number().min(0).max(1).default(0.25),
  rows: z.array(sizeGuideRowSchema).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const fabricProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  stretch: z.enum(stretchLevels),
  shrinkageRisk: z.number().min(0).max(1),
  notes: z.string().default("")
});

export const sizeSystemReferenceSchema = z.object({
  id: z.string().min(1),
  code: z.enum(sizeSystems),
  label: z.string().min(1),
  description: z.string().default(""),
  uncertaintyNote: z.string().default(""),
  isApproximate: z.boolean().default(true),
  provenance: z.string().default("Référence locale illustrative, non officielle.")
});

export type Brand = z.infer<typeof brandSchema>;
export type BrandSizeGuide = z.infer<typeof brandSizeGuideSchema>;
export type SizeGuideRow = z.infer<typeof sizeGuideRowSchema>;
export type MeasurementRange = z.infer<typeof measurementRangeSchema>;
export type FabricProfile = z.infer<typeof fabricProfileSchema>;
export type SizeSystemReference = z.infer<typeof sizeSystemReferenceSchema>;
