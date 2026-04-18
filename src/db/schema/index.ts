import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
};

export const bodyProfiles = sqliteTable("body_profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  version: integer("version").notNull(),
  profileMode: text("profile_mode"),
  heightCm: real("height_cm"),
  weightKg: real("weight_kg"),
  bodyFatPercent: real("body_fat_percent"),
  notes: text("notes").notNull().default(""),
  rawJson: text("raw_json", { mode: "json" }).notNull(),
  ...timestamps
});

export const bodyMeasurements = sqliteTable(
  "body_measurements",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id").notNull().references(() => bodyProfiles.id, { onDelete: "cascade" }),
    measurementKey: text("measurement_key").notNull(),
    value: real("value").notNull(),
    unit: text("unit").notNull(),
    sourceType: text("source_type").notNull(),
    sourceName: text("source_name").notNull(),
    confidence: real("confidence").notNull().default(1),
    ...timestamps
  },
  (table) => [uniqueIndex("body_measurements_profile_key_unique").on(table.profileId, table.measurementKey)]
);

export const bodyProfileVersions = sqliteTable("body_profile_versions", {
  id: text("id").primaryKey(),
  profileId: text("profile_id").notNull().references(() => bodyProfiles.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  reason: text("reason").notNull(),
  snapshotJson: text("snapshot_json", { mode: "json" }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const comfortPreferences = sqliteTable(
  "comfort_preferences",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id").notNull().references(() => bodyProfiles.id, { onDelete: "cascade" }),
    garmentCategory: text("garment_category").notNull(),
    fitPreference: text("fit_preference").notNull(),
    easePreference: text("ease_preference").notNull(),
    compressionTolerance: real("compression_tolerance"),
    layeringIntent: text("layering_intent").notNull(),
    fabricSensitivity: real("fabric_sensitivity"),
    shrinkageRiskTolerance: real("shrinkage_risk_tolerance"),
    ...timestamps
  },
  (table) => [uniqueIndex("comfort_profile_category_unique").on(table.profileId, table.garmentCategory)]
);

export const garmentCategories = sqliteTable("garment_categories", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  family: text("family").notNull(),
  definitionJson: text("definition_json", { mode: "json" }).notNull(),
  ...timestamps
});

export const garmentTypes = sqliteTable("garment_types", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull().references(() => garmentCategories.id),
  label: text("label").notNull(),
  notes: text("notes").notNull().default(""),
  ...timestamps
});

export const sizeSystems = sqliteTable("size_systems", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  label: text("label").notNull(),
  description: text("description").notNull().default(""),
  uncertaintyNote: text("uncertainty_note").notNull().default(""),
  isApproximate: integer("is_approximate", { mode: "boolean" }).notNull().default(true),
  provenance: text("provenance").notNull().default(""),
  ...timestamps
});

export const sizeLabels = sqliteTable("size_labels", {
  id: text("id").primaryKey(),
  sizeSystemId: text("size_system_id").notNull().references(() => sizeSystems.id),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  notes: text("notes").notNull().default(""),
  ...timestamps
});

export const brands = sqliteTable("brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country"),
  website: text("website"),
  isSample: integer("is_sample", { mode: "boolean" }).notNull().default(false),
  notes: text("notes").notNull().default(""),
  rawJson: text("raw_json", { mode: "json" }).notNull(),
  ...timestamps
});

export const brandSizeGuides = sqliteTable("brand_size_guides", {
  id: text("id").primaryKey(),
  brandId: text("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  garmentCategory: text("garment_category").notNull(),
  sizeSystem: text("size_system").notNull(),
  fabricStretch: text("fabric_stretch").notNull(),
  fitNotes: text("fit_notes").notNull().default(""),
  fabricNotes: text("fabric_notes").notNull().default(""),
  sourceType: text("source_type").notNull(),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url"),
  isSample: integer("is_sample", { mode: "boolean" }).notNull().default(false),
  isComplete: integer("is_complete", { mode: "boolean" }).notNull().default(false),
  uncertainty: real("uncertainty").notNull().default(0.25),
  rawJson: text("raw_json", { mode: "json" }).notNull(),
  ...timestamps
});

export const brandSizeGuideRows = sqliteTable("brand_size_guide_rows", {
  id: text("id").primaryKey(),
  guideId: text("guide_id").notNull().references(() => brandSizeGuides.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  sortOrder: integer("sort_order").notNull(),
  notes: text("notes").notNull().default(""),
  rawJson: text("raw_json", { mode: "json" }).notNull(),
  ...timestamps
});

export const brandSizeGuideMeasurements = sqliteTable("brand_size_guide_measurements", {
  id: text("id").primaryKey(),
  rowId: text("row_id").notNull().references(() => brandSizeGuideRows.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(),
  minValue: real("min_value"),
  maxValue: real("max_value"),
  targetValue: real("target_value"),
  unit: text("unit").notNull(),
  sourceNote: text("source_note"),
  ...timestamps
});

export const fabricProfiles = sqliteTable("fabric_profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  stretch: text("stretch").notNull(),
  shrinkageRisk: real("shrinkage_risk").notNull().default(0),
  notes: text("notes").notNull().default(""),
  ...timestamps
});

export const fitProfiles = sqliteTable("fit_profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  fitPreference: text("fit_preference").notNull(),
  easePreference: text("ease_preference").notNull(),
  notes: text("notes").notNull().default(""),
  ...timestamps
});

export const recommendationRuns = sqliteTable("recommendation_runs", {
  id: text("id").primaryKey(),
  profileId: text("profile_id").notNull(),
  guideId: text("guide_id").notNull(),
  garmentCategory: text("garment_category").notNull(),
  inputJson: text("input_json", { mode: "json" }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const recommendationResults = sqliteTable("recommendation_results", {
  id: text("id").primaryKey(),
  runId: text("run_id").notNull().references(() => recommendationRuns.id, { onDelete: "cascade" }),
  recommendedSize: text("recommended_size").notNull(),
  confidenceScore: real("confidence_score").notNull(),
  resultJson: text("result_json", { mode: "json" }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const importSources = sqliteTable("import_sources", {
  id: text("id").primaryKey(),
  sourceName: text("source_name").notNull(),
  sourceType: text("source_type").notNull(),
  sourceUrl: text("source_url"),
  metadataJson: text("metadata_json", { mode: "json" }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const importJobs = sqliteTable("import_jobs", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  sourceName: text("source_name").notNull(),
  status: text("status").notNull(),
  warningsJson: text("warnings_json", { mode: "json" }).notNull(),
  errorsJson: text("errors_json", { mode: "json" }).notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  valueJson: text("value_json", { mode: "json" }).notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
});
