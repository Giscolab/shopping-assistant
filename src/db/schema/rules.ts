import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ontologyBundles, ontologyGarmentCategories } from "@/db/schema/ontology";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
};

export const sizingRuleSets = sqliteTable("sizing_rule_sets", {
  id: text("id").primaryKey(),
  bundleId: text("bundle_id").notNull().references(() => ontologyBundles.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  ruleSetJson: text("rule_set_json", { mode: "json" }).notNull(),
  ...timestamps
});

export const sizingRuleDimensions = sqliteTable("sizing_rule_dimensions", {
  id: text("id").primaryKey(),
  ruleSetId: text("rule_set_id").notNull().references(() => sizingRuleSets.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => ontologyGarmentCategories.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(),
  baseEaseCm: real("base_ease_cm").notNull(),
  weight: real("weight").notNull(),
  closeFitDeltaCm: real("close_fit_delta_cm").notNull().default(0),
  relaxedFitDeltaCm: real("relaxed_fit_delta_cm").notNull().default(0),
  sortOrder: integer("sort_order").notNull(),
  ...timestamps
});
