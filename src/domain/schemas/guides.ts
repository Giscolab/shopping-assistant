import { z } from "zod";
import { brandSchema, brandSizeGuideSchema, measurementRangeSchema, sizeGuideRowSchema } from "@/domain/sizing/schema";

export const guideProvenanceSchema = z.object({
  sourceType: z.enum(["manual", "csv_import", "json_import", "seed"]),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url().nullable().default(null),
  uncertainty: z.number().min(0).max(1),
  assumptions: z.array(z.string()).default([])
});

export const guideValidationIssueSchema = z.object({
  severity: z.enum(["info", "warning", "error"]),
  code: z.string().min(1),
  message: z.string().min(1),
  guideId: z.string().optional(),
  rowId: z.string().optional(),
  dimension: z.string().optional()
});

export { brandSchema, brandSizeGuideSchema, measurementRangeSchema, sizeGuideRowSchema };
