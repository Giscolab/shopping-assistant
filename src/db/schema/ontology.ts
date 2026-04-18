import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
};

export const ontologyBundles = sqliteTable("ontology_bundles", {
  id: text("id").primaryKey(),
  version: text("version").notNull(),
  scope: text("scope").notNull(),
  provenanceType: text("provenance_type").notNull(),
  truthfulnessNote: text("truthfulness_note").notNull(),
  bundleJson: text("bundle_json", { mode: "json" }).notNull(),
  ...timestamps
});

export const ontologyFamilies = sqliteTable("ontology_families", {
  id: text("id").primaryKey(),
  bundleId: text("bundle_id").notNull().references(() => ontologyBundles.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  description: text("description").notNull(),
  ...timestamps
});

export const ontologyGarmentCategories = sqliteTable(
  "ontology_garment_categories",
  {
    id: text("id").primaryKey(),
    bundleId: text("bundle_id").notNull().references(() => ontologyBundles.id, { onDelete: "cascade" }),
    canonicalCategory: text("canonical_category").notNull(),
    legacyCategory: text("legacy_category"),
    family: text("family").notNull(),
    label: text("label").notNull(),
    easeProfile: text("ease_profile").notNull(),
    defaultCut: text("default_cut").notNull(),
    defaultMaterialProfile: text("default_material_profile").notNull(),
    categoryJson: text("category_json", { mode: "json" }).notNull(),
    ...timestamps
  },
  (table) => [uniqueIndex("ontology_category_bundle_unique").on(table.bundleId, table.id)]
);

export const ontologyMeasurementMappings = sqliteTable("ontology_measurement_mappings", {
  id: text("id").primaryKey(),
  bundleId: text("bundle_id").notNull().references(() => ontologyBundles.id, { onDelete: "cascade" }),
  labelFr: text("label_fr").notNull(),
  bodyKeysJson: text("body_keys_json", { mode: "json" }).notNull(),
  guideAliasesJson: text("guide_aliases_json", { mode: "json" }).notNull(),
  requiresGuideOnly: integer("requires_guide_only", { mode: "boolean" }).notNull().default(false),
  ...timestamps
});

export const ontologyPriorityDimensions = sqliteTable("ontology_priority_dimensions", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull().references(() => ontologyGarmentCategories.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(),
  weight: real("weight").notNull(),
  sortOrder: integer("sort_order").notNull(),
  ...timestamps
});
