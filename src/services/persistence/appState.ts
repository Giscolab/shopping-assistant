import { z } from "zod";
import { comfortPreferenceSchema, bodyProfileSchema, bodyProfileVersionSchema } from "@/domain/body-profile/schema";
import { recommendationRunSchema } from "@/domain/recommendation/schema";
import {
  brandSchema,
  brandSizeGuideSchema,
  fabricProfileSchema,
  sizeSystemReferenceSchema
} from "@/domain/sizing/schema";
import { defaultSizeSystemReferences } from "@/domain/sizing/sizeSystems";
import { createSampleGuides, sampleBrand } from "@/domain/sizing/sampleGuides";
import { garmentCategories } from "@/domain/shared/enums";
import { createId, nowIso } from "@/domain/shared/ids";

export const importJobSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["body_profile_html", "brand_guide_csv", "brand_guide_json"]),
  sourceName: z.string().min(1),
  status: z.enum(["previewed", "completed", "failed"]),
  warnings: z.array(z.string()).default([]),
  errors: z.array(z.string()).default([]),
  createdAt: z.string().datetime()
});

export const appSettingsSchema = z.object({
  theme: z.enum(["light", "dark"]).default("light"),
  activeProfileId: z.string().nullable().default(null),
  privacyMode: z.enum(["local_only"]).default("local_only")
});

export const appStateSchema = z.object({
  schemaVersion: z.literal(1),
  bodyProfiles: z.array(bodyProfileSchema),
  bodyProfileVersions: z.array(bodyProfileVersionSchema),
  comfortPreferences: z.array(comfortPreferenceSchema),
  brands: z.array(brandSchema),
  brandSizeGuides: z.array(brandSizeGuideSchema),
  fabricProfiles: z.array(fabricProfileSchema),
  sizeSystems: z.array(sizeSystemReferenceSchema),
  recommendationRuns: z.array(recommendationRunSchema),
  importJobs: z.array(importJobSchema),
  settings: appSettingsSchema
});

export type ImportJob = z.infer<typeof importJobSchema>;
export type AppSettings = z.infer<typeof appSettingsSchema>;
export type AppState = z.infer<typeof appStateSchema>;

export function createDefaultComfortPreferences(profileId: string, timestamp = nowIso()) {
  return garmentCategories.map((category) =>
    comfortPreferenceSchema.parse({
      id: createId("comfort"),
      profileId,
      garmentCategory: category,
      fitPreference: category === "hoodies" || category === "coats" ? "relaxed" : "regular",
      easePreference: "balanced",
      compressionTolerance: category === "boxers_or_underwear" || category === "socks" ? 6 : 3,
      layeringIntent: category === "coats" ? "winter_layering" : category === "jackets" || category === "hoodies" ? "over_layer" : "single_layer",
      fabricSensitivity: 4,
      shrinkageRiskTolerance: 5,
      createdAt: timestamp,
      updatedAt: timestamp
    })
  );
}

export function createDefaultAppState(): AppState {
  return appStateSchema.parse({
    schemaVersion: 1,
    bodyProfiles: [],
    bodyProfileVersions: [],
    comfortPreferences: [],
    brands: [sampleBrand],
    brandSizeGuides: createSampleGuides(),
    fabricProfiles: [
      {
        id: "fabric_cotton_low",
        name: "Coton chaîne et trame",
        stretch: "low",
        shrinkageRisk: 0.25,
        notes: "Profil textile générique pour chemises et pantalons."
      },
      {
        id: "fabric_knit_medium",
        name: "Maille coton",
        stretch: "medium",
        shrinkageRisk: 0.35,
        notes: "Profil textile générique pour t-shirts, pulls et hoodies."
      },
      {
        id: "fabric_elastic_high",
        name: "Élastique / stretch",
        stretch: "high",
        shrinkageRisk: 0.15,
        notes: "Profil textile générique pour sous-vêtements ou chaussettes."
      }
    ],
    sizeSystems: defaultSizeSystemReferences,
    recommendationRuns: [],
    importJobs: [],
    settings: {
      theme: "light",
      activeProfileId: null,
      privacyMode: "local_only"
    }
  });
}

export function validateState(input: unknown): AppState {
  return appStateSchema.parse(input);
}

export function upsertById<T extends { id: string }>(items: T[], item: T) {
  const index = items.findIndex((candidate) => candidate.id === item.id);
  if (index === -1) return [...items, item];
  const copy = [...items];
  copy[index] = item;
  return copy;
}
