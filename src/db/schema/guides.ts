import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`)
};

export const brandGuideAssumptions = sqliteTable("brand_guide_assumptions", {
  id: text("id").primaryKey(),
  guideId: text("guide_id").notNull(),
  assumption: text("assumption").notNull(),
  severity: text("severity").notNull().default("info"),
  ...timestamps
});

export const brandGuideQualityChecks = sqliteTable("brand_guide_quality_checks", {
  id: text("id").primaryKey(),
  guideId: text("guide_id").notNull(),
  checkCode: text("check_code").notNull(),
  severity: text("severity").notNull(),
  message: text("message").notNull(),
  affectedRows: integer("affected_rows").notNull().default(0),
  confidencePenalty: real("confidence_penalty").notNull().default(0),
  ...timestamps
});
