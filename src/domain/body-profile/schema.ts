import { z } from "zod";
import {
  easePreferences,
  fitPreferences,
  garmentCategories,
  layeringIntents,
  measurementKeys,
  profileModes
} from "@/domain/shared/enums";

const nullablePositive = z.number().finite().positive().nullable();
const nullablePercent = z.number().finite().min(0).max(80).nullable();

export const measurementProvenanceSchema = z.object({
  sourceType: z.enum(["manual", "html_import", "json_import", "csv_import", "seed"]),
  sourceName: z.string().min(1),
  importedAt: z.string().datetime(),
  originalLabel: z.string().optional(),
  originalUnit: z.string().optional(),
  confidence: z.number().min(0).max(1).default(1)
});

export const bodyProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Le nom du profil est requis."),
  version: z.number().int().positive(),
  profileMode: z.enum(profileModes).nullable().default(null),
  heightCm: nullablePositive,
  weightKg: nullablePositive,
  bodyFatPercent: nullablePercent,
  chestCm: nullablePositive,
  waistCm: nullablePositive,
  stomachCm: nullablePositive,
  seatHipsCm: nullablePositive,
  leftBicepsCm: nullablePositive,
  rightBicepsCm: nullablePositive,
  leftForearmCm: nullablePositive,
  rightForearmCm: nullablePositive,
  leftThighCm: nullablePositive,
  rightThighCm: nullablePositive,
  leftCalfCm: nullablePositive,
  rightCalfCm: nullablePositive,
  footLengthMm: z.number().finite().positive().nullable(),
  shoeSizeRefs: z
    .array(
      z.object({
        system: z.string().min(1),
        value: z.string().min(1),
        note: z.string().optional()
      })
    )
    .default([]),
  notes: z.string().default(""),
  provenance: z.partialRecord(z.enum(measurementKeys), measurementProvenanceSchema).default({}),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type BodyProfile = z.infer<typeof bodyProfileSchema>;
export type MeasurementProvenance = z.infer<typeof measurementProvenanceSchema>;

export const comfortPreferenceSchema = z.object({
  id: z.string().min(1),
  profileId: z.string().min(1),
  garmentCategory: z.enum(garmentCategories),
  fitPreference: z.enum(fitPreferences),
  easePreference: z.enum(easePreferences),
  compressionTolerance: z.number().min(0).max(10).nullable().default(null),
  layeringIntent: z.enum(layeringIntents).default("single_layer"),
  fabricSensitivity: z.number().min(0).max(10).nullable().default(null),
  shrinkageRiskTolerance: z.number().min(0).max(10).nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export type ComfortPreference = z.infer<typeof comfortPreferenceSchema>;

export const bodyProfileVersionSchema = z.object({
  id: z.string().min(1),
  profileId: z.string().min(1),
  version: z.number().int().positive(),
  snapshot: bodyProfileSchema,
  reason: z.string().default("Mise à jour manuelle"),
  createdAt: z.string().datetime()
});

export type BodyProfileVersion = z.infer<typeof bodyProfileVersionSchema>;

export const editableBodyProfileSchema = bodyProfileSchema
  .omit({ id: true, version: true, provenance: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().min(1, "Le nom du profil est requis."),
    heightCm: z.coerce.number().positive("La taille doit être positive.").nullable().or(z.literal("").transform(() => null)),
    weightKg: z.coerce.number().positive("Le poids doit être positif.").nullable().or(z.literal("").transform(() => null))
  });
